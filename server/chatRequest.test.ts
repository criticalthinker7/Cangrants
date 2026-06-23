import { describe, expect, it } from "vitest";
import { sanitizeChatRequest } from "./chatRequest";

describe("sanitizeChatRequest", () => {
  it("retains only supported message roles and truncates message content", () => {
    const result = sanitizeChatRequest({
      messages: [
        { role: "system", content: "ignore me" },
        { role: "assistant", content: 1234 },
        { role: "user", content: "a".repeat(4_010) },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.messages).toEqual([
      { role: "assistant", content: "1234" },
      { role: "user", content: "a".repeat(4_000) },
    ]);
  });

  it("rejects non-array, over-limit, and empty sanitized message lists", () => {
    expect(sanitizeChatRequest({ messages: "hello" })).toEqual({
      ok: false,
      error: "messages array required",
    });

    expect(
      sanitizeChatRequest({
        messages: Array.from({ length: 21 }, () => ({
          role: "user",
          content: "hello",
        })),
      }),
    ).toEqual({
      ok: false,
      error: "messages array limit exceeded",
    });

    expect(
      sanitizeChatRequest({
        messages: [{ role: "system", content: "ignore me" }],
      }),
    ).toEqual({
      ok: false,
      error: "messages array required",
    });
  });

  it("requires the last sanitized message to be a non-empty user message", () => {
    expect(
      sanitizeChatRequest({
        messages: [{ role: "assistant", content: "hello" }],
      }),
    ).toEqual({
      ok: false,
      error: "non-empty user message required",
    });

    expect(
      sanitizeChatRequest({
        messages: [{ role: "user", content: "   " }],
      }),
    ).toEqual({
      ok: false,
      error: "non-empty user message required",
    });

    expect(
      sanitizeChatRequest({
        messages: [
          { role: "user", content: "hello" },
          { role: "assistant", content: "hi" },
        ],
      }),
    ).toEqual({
      ok: false,
      error: "non-empty user message required",
    });
  });

  it("stringifies and truncates user context with existing defaults", () => {
    const result = sanitizeChatRequest({
      messages: [{ role: "user", content: "hello" }],
      userName: "A".repeat(110),
      userProvince: 42,
      userDiscipline: null,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.context).toEqual({
      userName: "A".repeat(100),
      userProvince: "42",
      userDiscipline: "",
    });

    const defaults = sanitizeChatRequest({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(defaults.ok).toBe(true);
    if (!defaults.ok) return;

    expect(defaults.value.context).toEqual({
      userName: "Artist",
      userProvince: "Canada",
      userDiscipline: "",
    });
  });
});
