const MAX_CHAT_MESSAGES = 20;

export type ChatPayloadMessage = {
  role: "user" | "assistant";
  content: string;
};

export const windowChatMessages = (
  messages: ChatPayloadMessage[],
): ChatPayloadMessage[] => messages.slice(-MAX_CHAT_MESSAGES);
