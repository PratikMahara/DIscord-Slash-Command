# BotDash — Discord Slash Command Bot + Admin Dashboard

A production-ready full-stack Discord bot with an AI-powered admin dashboard. Users run slash commands in Discord; the bot analyzes reports with AI, mirrors activity to Slack, and admins monitor everything through a live React dashboard.

---

## Live Demo

| Service | URL |
| --------- | --- |
| Dashboard | `https://your-frontend.onrender.com` |
| API | `https://your-api.onrender.com` |
| Interactions Endpoint | `https://your-api.onrender.com/api/interactions` |

**Admin login:** username: `admin` / password: `admin123`

---

## What it does

### Discord Bot

- Registers and handles two slash commands: `/report` and `/status`
- Verifies **every** incoming Discord request with Ed25519 signature validation (tweetnacl) — forged or unsigned requests are rejected with 401
- Deduplicates interactions by Discord interaction ID — the same event is never processed twice
- Responds to Discord within the 3-second window — no timeouts
- Mirrors all command activity to a Slack channel via incoming webhook
- Persists every interaction to PostgreSQL with full metadata

### `/report` command (AI-powered)

When a user runs `/report text:The server is down`:

1. Bot receives the interaction
2. Sends the text to **Groq AI (llama3-8b-8192)** for triage
3. AI returns a structured analysis: summary, tag, and priority
4. Bot replies in Discord with the full AI analysis:

```
✅ Report received from pratik: "The server is down"
🤖 AI Summary: Server outage reported, needs urgent attention
🏷️ Tag: `urgent` | Priority: `high`
```

5. Mirrors the result (including AI tag and priority) to Slack
6. Saves everything to the database

If Groq is unavailable, the bot falls back gracefully — it still logs the interaction and responds in Discord without crashing.

### `/status` command

Returns a simple online/operational status message.

### Admin Dashboard

- JWT-protected login — no unauthenticated access to any dashboard route
- **Overview** — live stats: total commands, mirrored count, breakdown by command
- **Reports** — browse all `/report` submissions with AI summary, tag, and color-coded priority (red = high, orange = medium, green = low)
- **Logs** — paginated history of every interaction with full metadata
- **Settings** — bot configuration UI
- Auto-refreshes every 10 seconds

---

## Tech Stack

| Layer | Technology |
| -------- | ------------------------------------------ |
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL via Supabase |
| Auth | bcryptjs + JWT |
| AI | Groq API — llama3-8b-8192 (free tier) |
| Discord | Interactions API, Ed25519 via tweetnacl |
| Mirroring | Slack Incoming Webhooks |
| Hosting | Render (backend + frontend) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A PostgreSQL database ([Supabase](https://supabase.com) free tier recommended)
- A [Discord application](https://discord.com/developers/applications) with a bot and slash commands
- A [Groq API key](https://console.groq.com) (free, no credit card required)
- A [Slack incoming webhook URL](https://api.slack.com/apps) (free)

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/PratikMahara/DIscord-Slash-Command.git
cd DIscord-Slash-Command

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Set up environment variables

```bash
# Copy the example file
cp .env.example backend/.env
```

Fill in all the values in `backend/.env` — see [Environment Variables](#environment-variables) below.

Also create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Set up the database

Run this SQL in your Supabase SQL Editor (or any Postgres client):

```sql
CREATE TABLE interactions (
  id          TEXT PRIMARY KEY,
  guild_id    TEXT,
  channel_id  TEXT,
  user_id     TEXT,
  username    TEXT,
  command     TEXT,
  options     JSONB,
  response    TEXT,
  mirrored    BOOLEAN DEFAULT FALSE,
  status      TEXT DEFAULT 'processed',
  ai_summary  TEXT,
  ai_tag      TEXT,
  ai_priority TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE server_configs (
  guild_id     TEXT PRIMARY KEY,
  guild_name   TEXT,
  log_channel_id TEXT,
  mirror_webhook_url TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Create the admin user

```bash
cd backend
node src/scripts/createAdmin.js
```

This creates: **username:** `admin` / **password:** `admin123`

### 5. Register Discord slash commands

```bash
cd backend
node src/scripts/registerCommands.js
```

You should see both `/report` and `/status` registered successfully.

### 6. Run the apps

**Terminal 1 — Backend:**

```bash
cd backend
npm start
# Server running on http://localhost:3001
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
# App running on http://localhost:3000
```

### 7. Set up Discord interactions endpoint (local)

Discord requires a public HTTPS URL. For local development use [ngrok](https://ngrok.com):

```bash
ngrok http 3001
# Gives you: https://abc123.ngrok-free.app
```

Then in [Discord Developer Portal](https://discord.com/developers/applications):
- Go to your app → **General Information**
- Set **Interactions Endpoint URL** to: `https://abc123.ngrok-free.app/api/interactions`
- Click **Save Changes** — Discord will verify the endpoint automatically

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| -------------------- | -------- | -------------------------------------------------------- |
| `PORT` | No | Express server port (default: `3001`) |
| `FRONTEND_URL` | Yes | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (Supabase pooler URL) |
| `JWT_SECRET` | Yes | Long random string for signing admin JWT tokens |
| `DISCORD_APP_ID` | Yes | Discord application ID (General Information tab) |
| `DISCORD_TOKEN` | Yes | Discord bot token (Bot tab) |
| `DISCORD_PUBLIC_KEY` | Yes | Discord public key hex string (General Information tab) |
| `SLACK_WEBHOOK_URL` | No | Slack incoming webhook URL for mirroring |
| `GROQ_API_KEY` | Yes | Groq API key for AI triage (free at console.groq.com) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --------------- | -------- | ------------------------------------------------ |
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:3001/api`) |

---

## Deployment

### Backend on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Configure:

| Field | Value |
| ----- | ----- |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node src/index.js` |

4. Add all environment variables from `backend/.env` in the Render dashboard
5. Set `FRONTEND_URL` to your deployed frontend URL
6. Deploy — you'll get a URL like `https://discord-bot-xxxx.onrender.com`
7. Health check: `GET https://discord-bot-xxxx.onrender.com/health` → `{ "status": "ok" }`

### Frontend on Render

1. **New → Static Site** → connect same repo
2. Configure:

| Field | Value |
| ----- | ----- |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

3. Add environment variable: `VITE_API_URL=https://discord-bot-xxxx.onrender.com/api`
4. Deploy

### Set Discord Interactions Endpoint

In [Discord Developer Portal](https://discord.com/developers/applications):
- Go to your app → **General Information**
- Set **Interactions Endpoint URL** to:
```
https://discord-bot-xxxx.onrender.com/api/interactions
```
- Click **Save Changes** ✅

---

## Testing the Bot

### Add bot to your Discord server

1. Go to Discord Developer Portal → your app → **OAuth2 → URL Generator**
2. Scopes: check `bot` and `applications.commands`
3. Bot Permissions: check `Send Messages` and `Read Messages/View Channels`
4. Copy the generated URL → open in browser → add to your server

### Run slash commands

In your Discord server:

```
/report text:The database is throwing 500 errors
/status
```

### Verify everything works end-to-end

| Check | Expected |
| ----- | -------- |
| Bot replies in Discord | ✅ With AI summary, tag, priority |
| Slack message appears | ✅ With AI tag and priority |
| Dashboard logs update | ✅ New row with all fields |
| AI columns filled | ✅ summary, tag, priority |
| Duplicate command | ✅ Silently ignored (dedup) |
| Forged request | ✅ 401 rejected |

---

## Project Structure

```
DIscord-Slash-Command/
├── backend/
│   └── src/
│       ├── routes/
│       │   ├── interactions.js   # Discord slash command handler + AI triage
│       │   ├── auth.js           # Admin login, JWT issue
│       │   └── dashboard.js      # Logs, stats API
│       ├── middleware/
│       │   ├── verifyDiscord.js  # Ed25519 signature verification (tweetnacl)
│       │   └── auth.js           # JWT requireAuth middleware
│       ├── db/
│       │   └── index.js          # PostgreSQL pool (Supabase)
│       └── scripts/
│           ├── registerCommands.js  # Register slash commands with Discord
│           └── createAdmin.js       # Seed first admin user
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   └── Dashboard.jsx
│       ├── App.jsx
│       └── api.js               # Axios client with JWT interceptor
├── .env.example                 # All variables documented, no real secrets
├── AI_NOTES.md                  # AI tool usage and reflections
└── README.md
```

---

## Security

- All Discord requests verified with Ed25519 — forged requests return 401
- Interaction IDs deduplicated in the database — replay attacks have no effect
- JWT tokens expire after 24 hours
- All secrets in environment variables — nothing hardcoded or exposed client-side
- `.env` is gitignored — only `.env.example` with empty values is committed
- Groq API key is server-side only — never sent to the frontend

---

## What I'd improve with more time

- **Retry queue** — if Slack mirror fails, queue and retry with exponential backoff
- **Interactive buttons** — Approve/Reject buttons on report responses (Discord message components)
- **Modal form** — open a Discord modal on `/report` instead of inline text option
- **Multi-server support** — each Discord server isolated with its own config and log view
- **Rate limiting** — protect the interactions endpoint from abuse
- **Better observability** — structured JSON logs, visible failure history

---

## License

ISC