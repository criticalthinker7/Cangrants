import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  userName: string;
  userProvince: string;
  userDiscipline: string;
}

const GRANT_SUMMARY = `CanGrants lists 48 Canadian and international arts grants including Telefilm Talent to Watch, Canada Council Explore and Create, TAC Media Artists, CMF, Sundance, TIFF Talent Lab, Berlinale Talents, and Ontario Creates programs.`;

function fallbackReply(
  messages: ChatMessage[],
  context: ChatContext,
): string {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const q = last.toLowerCase();

  if (q.includes("urgent") || q.includes("deadline")) {
    return `Hi ${context.userName}, check Discover and filter by "Urgent (≤14 days)" for approaching deadlines. Rolling programs (Telefilm Development, several TAC streams) stay open year-round.`;
  }

  if (q.includes("eligible") || q.includes("eligibility")) {
    return `Based on your profile (${context.userDiscipline || "artist"} in ${context.userProvince || "Canada"}), start with Canada Council Explore and Create, Ontario Arts Council programs in your discipline, and Toronto Arts Council if you're in Toronto. Use Saved to shortlist, then open each grant's eligibility section before applying.`;
  }

  if (q.includes("draft") || q.includes("proposal") || q.includes("statement")) {
    return `I can help structure a draft. Share: (1) grant name, (2) project title and medium, (3) budget range, (4) 2–3 sentences on impact. For now, open the grant in Discover → Track → AI Draft to pre-fill this chat once your API key is configured.`;
  }

  return `Hi ${context.userName}! I'm your CanGrants assistant. Ask about eligibility for your discipline, urgent deadlines, or request help drafting a proposal. ${GRANT_SUMMARY}\n\nTip: add GEMINI_API_KEY to enable full AI responses.`;
}

export async function generateChatReply(
  messages: ChatMessage[],
  context: ChatContext,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return fallbackReply(messages, context);
  }

  const ai = new GoogleGenAI({ apiKey });
  const history = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const prompt = `You are the CanGrants AI assistant for Canadian artists and producers.

User: ${context.userName}
Province: ${context.userProvince}
Discipline: ${context.userDiscipline || "not specified"}

${GRANT_SUMMARY}

Be concise, practical, and accurate about Canadian arts funding. When drafting proposals or artist statements, use clear paragraphs and ask for missing project details if needed.

Conversation:
${history}

Respond as the assistant:`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const text = response.text?.trim();
  return text || fallbackReply(messages, context);
}
