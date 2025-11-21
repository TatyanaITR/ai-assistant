export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "sending" | "sent" | "error";

export interface IChatMessage {
  messageId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
}
