// src/ui/Chat/components/MessageContent.tsx
import type { FC } from "react";

import { Loader2 } from "lucide-react";

import type { IChatMessage } from "@/domain/Chat/chat.types.ts";

interface MessageContentProps {
  message: IChatMessage;
}

export const MessageContent: FC<MessageContentProps> = ({ message }) => {
  const { role, status, content } = message;

  // States for assistant messages
  if (role === "assistant" && status === "sending") {
    return (
      <div className="flex gap-1 items-center">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    );
  }

  // States for user messages
  if (role === "user" && status === "sending") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex-1 whitespace-pre-wrap break-words">
          {content}
        </span>
        <Loader2 className="w-4 h-4 animate-spin text-blue-200 flex-shrink-0" />
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return <div className="text-red-700">{content || "Произошла ошибка"}</div>;
  }

  // Default sent state
  return <div className="whitespace-pre-wrap break-words">{content}</div>;
};
