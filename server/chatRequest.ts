import type { ChatContext, ChatMessage } from "./chat";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CONTENT_LENGTH = 4_000;
const MAX_CONTEXT_FIELD_LENGTH = 100;

type ChatRequestBody = {
  messages?: unknown;
  userName?: unknown;
  userProvince?: unknown;
  userDiscipline?: unknown;
};

type SanitizedChatRequest = {
  messages: ChatMessage[];
  context: ChatContext;
};

type SanitizeChatRequestResult =
  | { ok: true; value: SanitizedChatRequest }
  | { ok: false; error: string };

const stringifyAndTruncate = (value: unknown, maxLength: number): string =>
  String(value ?? "").slice(0, maxLength);

const isSupportedRole = (role: unknown): role is ChatMessage["role"] =>
  role === "user" || role === "assistant";

const sanitizeMessages = (messages: unknown[]): ChatMessage[] =>
  messages.flatMap((message): ChatMessage[] => {
    if (!message || typeof message !== "object") {
      return [];
    }

    const candidate = message as { role?: unknown; content?: unknown };
    if (!isSupportedRole(candidate.role)) {
      return [];
    }

    return [
      {
        role: candidate.role,
        content: stringifyAndTruncate(
          candidate.content,
          MAX_MESSAGE_CONTENT_LENGTH,
        ),
      },
    ];
  });

export const sanitizeChatRequest = (
  body: ChatRequestBody,
): SanitizeChatRequestResult => {
  if (!Array.isArray(body.messages)) {
    return { ok: false, error: "messages array required" };
  }

  if (body.messages.length > MAX_MESSAGES) {
    return { ok: false, error: "messages array limit exceeded" };
  }

  const messages = sanitizeMessages(body.messages);
  if (messages.length === 0) {
    return { ok: false, error: "messages array required" };
  }

  const lastMessage = messages.at(-1);
  if (
    !lastMessage ||
    lastMessage.role !== "user" ||
    lastMessage.content.trim().length === 0
  ) {
    return { ok: false, error: "non-empty user message required" };
  }

  return {
    ok: true,
    value: {
      messages,
      context: {
        userName:
          stringifyAndTruncate(body.userName, MAX_CONTEXT_FIELD_LENGTH) ||
          "Artist",
        userProvince:
          stringifyAndTruncate(body.userProvince, MAX_CONTEXT_FIELD_LENGTH) ||
          "Canada",
        userDiscipline: stringifyAndTruncate(
          body.userDiscipline,
          MAX_CONTEXT_FIELD_LENGTH,
        ),
      },
    },
  };
};
