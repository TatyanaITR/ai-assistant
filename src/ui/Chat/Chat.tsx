import { type FC, useEffect, useMemo, useRef } from "react";

import type { IChatMessage } from "@/domain/Chat/chat.types.ts";

import ChatMessage from "./components/ChatMessage.tsx";

interface ChatProps {
  messagesList: IChatMessage[];
}
const Chat: FC<ChatProps> = ({ messagesList }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);
  const renderedMessages = useMemo(
    () =>
      messagesList.map((message) => (
        <ChatMessage message={message} key={message.messageId} />
      )),
    [messagesList],
  );
  return (
    <>
      <ul className="flex flex-col gap-3">{renderedMessages}</ul>
      <div ref={messagesEndRef} />
    </>
  );
};
export default Chat;
