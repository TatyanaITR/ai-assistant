export const formatMessageDate = (date: Date | string): string => {
  const messageDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Сегодня";
  if (diffInDays === 1) return "Вчера";
  if (diffInDays < 7) return `${diffInDays} дн. назад`;

  return messageDate.toLocaleDateString("ru-RU");
};
