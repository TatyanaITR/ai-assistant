// src/ui/Chat/components/ChatMessage.tsx

import type { FC } from "react";

import { cva } from "class-variance-authority";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import type { IChatMessage } from "@/domain/Chat/chat.types.ts";
import {
  deleteMessage,
  startEditing,
  regenerateResponse,
  selectEditingMessageId,
  saveEditedMessage,
  cancelEditing,
} from "@/infrastructure/store/slices/chatSlice.ts";
import type { AppDispatch } from "@/infrastructure/store/store.ts";
import { formatMessageDate } from "@/shared/lib/formatDate.ts";
import { MessageContent } from "@/ui/Chat/components/MessageContent.tsx";
import { MessageEditForm } from "@/ui/Chat/components/MessageEditForm.tsx";

const messageVariants = cva(
  "flex flex-col gap-2 rounded-lg px-4 py-3 max-w-[80%] break-words animate-in fade-in slide-in-from-bottom-4 duration-300 relative",
  {
    variants: {
      role: {
        user: "bg-blue-500 text-white self-end ml-auto",
        assistant: "bg-gray-100 text-gray-900 self-start mr-auto",
        system: "bg-yellow-50 text-yellow-900 self-center mx-auto text-sm",
      },
      status: {
        sending: "opacity-60",
        sent: "opacity-100",
        error: "border-2 border-red-500 bg-red-50",
      },
      editing: {
        true: "bg-blue-600",
        false: "",
      },
    },
    defaultVariants: {
      role: "user",
      status: "sent",
      editing: false,
    },
  },
);

interface MessageProps {
  message: IChatMessage;
}

const ChatMessage: FC<MessageProps> = ({ message }) => {
  const dispatch = useDispatch<AppDispatch>();
  const editingMessageId = useSelector(selectEditingMessageId);
  const isLoading = useSelector(
    (state: { chat: { isLoading: boolean } }) => state.chat.isLoading,
  );

  const isEditing = editingMessageId === message.messageId;

  const handleDelete = () => {
    if (confirm("Удалить это сообщение?")) {
      dispatch(deleteMessage(message.messageId));
    }
  };

  const handleEdit = () => {
    dispatch(startEditing(message.messageId));
  };

  const handleRegenerate = () => {
    if (message.role === "assistant") {
      const userMessages = document.querySelectorAll('[data-role="user"]');
      if (userMessages.length === 0) return;

      const lastUserMessage = userMessages[userMessages.length - 1] as
        | HTMLElement
        | undefined;
      const userMessageId = lastUserMessage?.dataset?.messageId;

      if (typeof userMessageId === "string" && userMessageId) {
        dispatch(regenerateResponse(userMessageId));
      }
    }
  };

  const handleSaveEdit = async (newContent: string) => {
    await dispatch(
      saveEditedMessage({
        messageId: message.messageId,
        newContent,
      }),
    );

    dispatch(regenerateResponse(message.messageId));
  };

  const handleCancelEdit = () => {
    dispatch(cancelEditing());
  };

  const showActions = message.status === "sent" && !isEditing;

  return (
    <li
      className="group flex flex-col gap-1"
      data-role={message.role}
      data-message-id={message.messageId}
    >
      <div
        className={messageVariants({
          role: message.role === "user" && isEditing ? "user" : message.role,
          status: message.status,
          editing: isEditing,
        })}
      >
        {isEditing ? (
          <MessageEditForm
            initialContent={message.content}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <MessageContent message={message} />
        )}

        {message.status === "error" && (
          <span className="text-red-600 text-xs">Ошибка отправки</span>
        )}
      </div>

      <div
        className={`flex items-center gap-2 px-2 justify-end ${
          message.role === "assistant" ? "flex-row-reverse" : ""
        }`}
      >
        {showActions && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {message.role === "user" && (
              <>
                <button
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  title="Редактировать"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  title="Удалить"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {message.role === "assistant" && (
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                title="Перегенерировать ответ"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <span className="text-xs text-gray-500">
          {formatMessageDate(message.timestamp)}
        </span>
      </div>
    </li>
  );
};

export default React.memo(ChatMessage);
