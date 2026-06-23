import express from "express";
import fs from "fs";
import helmet from "helmet";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { generateChatReply } from "./chat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.API_PORT || 3001);
const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 3000;

const isValidMessages = (messages: unknown): messages is Array<{ role: "user" | "assistant"; content: string }> => {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return false;
  }
  return messages.every((message) => {
    if (!message || typeof message !== "object") return false;
    const maybe = message as { role?: unknown; content?: unknown };
    return (
      (maybe.role === "user" || maybe.role === "assistant") &&
      typeof maybe.content === "string" &&
      maybe.content.length > 0 &&
      maybe.content.length <= MAX_MESSAGE_LENGTH
    );
  });
};

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(
  "/api/chat",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 80,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many chat requests. Please wait a minute and try again." },
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cangrants" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userName, userProvince, userDiscipline } = req.body ?? {};
    if (!isValidMessages(messages)) {
      res.status(400).json({
        error: `messages must be 1-${MAX_MESSAGES} chat entries with role + content (max ${MAX_MESSAGE_LENGTH} chars each)`,
      });
      return;
    }

    const content = await generateChatReply(messages, {
      userName: userName || "Artist",
      userProvince: userProvince || "Canada",
      userDiscipline: userDiscipline || "",
    });

    res.json({ content });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      content:
        "The AI service is temporarily unavailable. Check that GEMINI_API_KEY is set, or try again shortly.",
    });
  }
});

const distIndex = path.resolve(__dirname, "../dist/index.html");
if (fs.existsSync(distIndex)) {
  const distPath = path.dirname(distIndex);
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(distIndex);
  });
}

app.listen(PORT, () => {
  console.log(`CanGrants server listening on http://localhost:${PORT}`);
});
