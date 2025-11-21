// src/infrastructure/store/slices/chatSlice.ts

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { IChatMessage, MessageRole } from "@/domain/Chat/chat.types";
import { huggingFaceService } from "@/infrastructure/api/huggingface.service";

interface ChatState {
  messages: IChatMessage[];
  isLoading: boolean;
  error: string | null;
  editingMessageId: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  editingMessageId: null,
};

// Вспомогательные функции для работы с сообщениями
const createMessage = (
  role: MessageRole,
  content: string,
  status: IChatMessage["status"] = "sent",
): IChatMessage => ({
  messageId: `${role}-${Date.now()}`,
  role,
  content,
  timestamp: new Date().toISOString(),
  status,
});

const buildHistoryForAPI = (messages: IChatMessage[]) =>
  messages
    .filter((msg) => msg.status === "sent")
    .map((msg) => ({
      role: msg.role as MessageRole,
      content: msg.content,
    }));

const findMessageIndex = (
  messages: IChatMessage[],
  predicate: (msg: IChatMessage) => boolean,
) => messages.findIndex(predicate);

const updateMessageStatus = (
  messages: IChatMessage[],
  predicate: (msg: IChatMessage) => boolean,
  status: IChatMessage["status"],
  content?: string,
) => {
  const index = findMessageIndex(messages, predicate);
  if (index !== -1) {
    messages[index].status = status;
    if (content !== undefined) {
      messages[index].content = content;
    }
    messages[index].timestamp = new Date().toISOString();
  }
  return index;
};

const removeMessagesByPredicate = (
  messages: IChatMessage[],
  predicate: (msg: IChatMessage) => boolean,
) => messages.filter((msg) => !predicate(msg));

/**
 * Async Thunk для отправки сообщения
 */
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageText: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { chat: ChatState };
      const historyForAPI = buildHistoryForAPI(state.chat.messages);

      historyForAPI.push({
        role: "user",
        content: messageText,
      });

      const assistantResponse =
        await huggingFaceService.sendMessage(historyForAPI);

      return {
        userMessage: messageText,
        assistantResponse,
      };
    } catch (error) {
      console.error("Error in sendMessage thunk:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to send message",
      );
    }
  },
);

/**
 * Async Thunk для перегенерации ответа
 */
export const regenerateResponse = createAsyncThunk(
  "chat/regenerateResponse",
  async (messageId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { chat: ChatState };
      const currentMessages = state.chat.messages;

      const targetMessageIndex = findMessageIndex(
        currentMessages,
        (msg) => msg.messageId === messageId && msg.role === "user",
      );

      if (targetMessageIndex === -1) {
        throw new Error("Message not found");
      }

      const historyForAPI = buildHistoryForAPI(
        currentMessages.slice(0, targetMessageIndex + 1),
      );

      const assistantResponse =
        await huggingFaceService.sendMessage(historyForAPI);

      return {
        assistantResponse,
        userMessageId: messageId,
      };
    } catch (error) {
      console.error("Error in regenerateResponse thunk:", error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to regenerate response",
      );
    }
  },
);

/**
 * Async Thunk для сохранения отредактированного сообщения
 * Автоматически отправляет новый запрос на сервер
 */
export const saveEditedMessage = createAsyncThunk(
  "chat/saveEditedMessage",
  async (
    { messageId, newContent }: { messageId: string; newContent: string },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { chat: ChatState };
      const message = state.chat.messages.find(
        (msg) => msg.messageId === messageId,
      );

      if (!message || message.role !== "user") {
        throw new Error("Invalid message for editing");
      }

      return { messageId, newContent };
    } catch (error) {
      console.error("Error in saveEditedMessage thunk:", error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to save edited message",
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(
        (msg) => msg.messageId !== action.payload,
      );
    },

    clearChat: (state) => {
      state.messages = [];
      state.error = null;
      state.isLoading = false;
      state.editingMessageId = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    startEditing: (state, action: PayloadAction<string>) => {
      const message = state.messages.find(
        (msg) => msg.messageId === action.payload,
      );
      if (message && message.role === "user") {
        state.editingMessageId = action.payload;
      }
    },

    cancelEditing: (state) => {
      state.editingMessageId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработчики для sendMessage
      .addCase(sendMessage.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;

        state.messages.push(createMessage("user", action.meta.arg, "sending"));
        state.messages.push(createMessage("assistant", "", "sending"));
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;

        updateMessageStatus(
          state.messages,
          (msg) => msg.role === "user" && msg.status === "sending",
          "sent",
        );

        updateMessageStatus(
          state.messages,
          (msg) => msg.role === "assistant" && msg.status === "sending",
          "sent",
          action.payload.assistantResponse,
        );
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;

        updateMessageStatus(
          state.messages,
          (msg) => msg.role === "user" && msg.status === "sending",
          "error",
        );

        state.messages = removeMessagesByPredicate(
          state.messages,
          (msg) => msg.role === "assistant" && msg.status === "sending",
        );
      })

      // Обработчики для regenerateResponse
      .addCase(regenerateResponse.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;

        const userMessageIndex = findMessageIndex(
          state.messages,
          (msg) => msg.messageId === action.meta.arg,
        );

        if (userMessageIndex !== -1) {
          state.messages = state.messages.slice(0, userMessageIndex + 1);
        }

        state.messages.push(createMessage("assistant", "", "sending"));
      })
      .addCase(regenerateResponse.fulfilled, (state, action) => {
        state.isLoading = false;

        updateMessageStatus(
          state.messages,
          (msg) => msg.role === "assistant" && msg.status === "sending",
          "sent",
          action.payload.assistantResponse,
        );
      })
      .addCase(regenerateResponse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;

        state.messages = removeMessagesByPredicate(
          state.messages,
          (msg) => msg.role === "assistant" && msg.status === "sending",
        );
      })

      // Обработчики для saveEditedMessage
      .addCase(saveEditedMessage.pending, (state) => {
        state.editingMessageId = null;
      })
      .addCase(saveEditedMessage.fulfilled, (state, action) => {
        const { messageId, newContent } = action.payload;
        const messageIndex = findMessageIndex(
          state.messages,
          (msg) => msg.messageId === messageId,
        );

        if (messageIndex !== -1) {
          state.messages[messageIndex].content = newContent;
          state.messages = state.messages.slice(0, messageIndex + 1);
        }
      })
      .addCase(saveEditedMessage.rejected, (state, action) => {
        state.error = action.payload as string;
        state.editingMessageId = null;
      });
  },
});

export const {
  deleteMessage,
  clearChat,
  clearError,
  startEditing,
  cancelEditing,
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectMessages = (state: { chat: ChatState }) =>
  state.chat.messages;
export const selectIsLoading = (state: { chat: ChatState }) =>
  state.chat.isLoading;
export const selectError = (state: { chat: ChatState }) => state.chat.error;
export const selectEditingMessageId = (state: { chat: ChatState }) =>
  state.chat.editingMessageId;
