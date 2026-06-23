import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateChatReply } from "./chat.js";
import { sanitizeChatRequest } from "./chatRequest.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.API_PORT || 3001);

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cangrants" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const sanitized = sanitizeChatRequest(req.body ?? {});
    if (sanitized.ok === false) {
      res.status(400).json({ error: sanitized.error });
      return;
    }

    const { messages, context } = sanitized.value;
    const content = await generateChatReply(messages, context);

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
