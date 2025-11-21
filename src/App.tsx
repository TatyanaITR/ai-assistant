// src/App.tsx
import React, { Suspense, useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/infrastructure/store/hooks";
import {
  sendMessage,
  clearChat,
  selectMessages,
  selectIsLoading,
  selectError,
} from "@/infrastructure/store/slices/chatSlice";
import { ChatInput } from "@/shared/layout/ChatInput";
import { Header } from "@/shared/layout/Header";
import { MainLayout } from "@/shared/layout/MainLayout";
import { EmptyState } from "@/ui/Chat/components/EmptyState.tsx";

function App() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const handleNewChat = () => {
    dispatch(clearChat());
  };

  const handleSendMessage = useCallback(
    async (message: string) => {
      try {
        await dispatch(sendMessage(message)).unwrap();
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [dispatch],
  );
  const Chat = React.lazy(() => import("@/ui/Chat/Chat"));
  const chatContent =
    messages.length === 0 ? (
      <EmptyState />
    ) : (
      <Suspense fallback={<div>Загрузка чата...</div>}>
        <Chat messagesList={messages} />
      </Suspense>
    );

  return (
    <MainLayout
      header={<Header onNewChat={handleNewChat} isLoading={isLoading} />}
      footer={
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      }
      error={error}
    >
      {chatContent}
    </MainLayout>
  );
}

export default App;
