<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CanGrants

AI-powered grant discovery and tracking for Canadian artists and producers — built by BetterHalf Labs.

Live demo: https://cangrants-betterhalf.vercel.app/

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` (optional — without it, the assistant uses built-in guidance)
3. Start the app: `npm run dev`
4. Open http://localhost:3000

**Demo login:** `demo@betterhalffilms.com` / `demo123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite frontend + API server (ports 3000 + 3001) |
| `npm run build` | Production build to `dist/` |
| `npm run start` | Serve `dist/` and `/api/chat` on port 3001 |
| `npm run preview` | Build then start production server |

## Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md). Static hosting works for the UI; host the Node server (or a serverless function) for AI chat.
