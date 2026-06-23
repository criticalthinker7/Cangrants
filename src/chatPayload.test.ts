import { describe, expect, it } from "vitest";
import { windowChatMessages } from "./chatPayload";

describe("windowChatMessages", () => {
  it("keeps the most recent 20 messages", () => {
    const messages = Array.from({ length: 25 }, (_, index) => ({
      role: index % 2 === 0 ? ("assistant" as const) : ("user" as const),
      content: `message-${index}`,
    }));

    expect(windowChatMessages(messages)).toEqual(messages.slice(5));
  });

  it("drops older messages while preserving recent message order", () => {
    const messages = Array.from({ length: 22 }, (_, index) => ({
      role: "user" as const,
      content: `turn-${index}`,
    }));

    const windowed = windowChatMessages(messages);

    expect(windowed).toHaveLength(20);
    expect(windowed[0]?.content).toBe("turn-2");
    expect(windowed.at(-1)?.content).toBe("turn-21");
  });
});
