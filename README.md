# BotDash — Discord Bot Admin Dashboard

A full-stack Discord bot with an admin dashboard for monitoring slash-command activity. Users interact with the bot in Discord; admins sign in to a React dashboard to view stats, logs, and reports.

## What it does

**Discord bot**

- Handles Discord slash-command interactions at `POST /api/interactions`
- **`/report`** — users submit a text report; the bot acknowledges it and logs the interaction
- **`/status`** — returns a simple online/operational message
- Verifies every Discord request with Ed25519 signature validation
- Mirrors command activity to Slack via an incoming webhook
- Persists all interactions in PostgreSQL (deduplicated by interaction ID)

**Admin dashboard (BotDash)**

- JWT-protected login for admin users
- **Dashboard** — overview stats (total interactions, mirrored count, usage by command) and recent activity
- **Reports** — browse `/report` submissions with search and detail view
- **Logs** — paginated history of all bot interactions
- **Settings** — UI for bot toggles (backend API pending; changes are local-only for now)

## Tech stack

| Layer    | Stack                                      |
| -------- | ------------------------------------------ |
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend  | Node.js, Express 5, PostgreSQL (`pg`)      |
| Auth     | bcrypt + JWT                               |
| Integrations | Discord Interactions API, Slack webhooks |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- PostgreSQL 14+ (local or hosted, e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com))
- A [Discord application](https://discord.com/developers/applications) with a bot token
- (Optional) A Slack incoming webhook URL for mirroring

## Local setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Assesment

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy the example file and create env files for each app:

```bash
# From the repo root — create backend/.env and frontend/.env
# using the sections in .env.example
```

See [Environment variables](#environment-variables) below for every required variable.

### 3. Set up the database

Create a PostgreSQL database, then run:

```sql
CREATE TABLE interactions (
  id          BIGINT PRIMARY KEY,
  guild_id    TEXT,
  channel_id  TEXT,
  user_id     TEXT,
  username    TEXT,
  command     TEXT,
  options     JSONB,
  response    TEXT,
  mirrored    BOOLEAN DEFAULT FALSE,
  status      TEXT DEFAULT 'processed',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
```

Create an admin user (default credentials printed by the script):

```bash
cd backend
node src/scripts/createAdmin.js
```

### 4. Register Discord slash commands

```bash
cd backend
node src/scripts/registerCommands.js
```

In the [Discord Developer Portal](https://discord.com/developers/applications), set the **Interactions Endpoint URL** to:

```
http://localhost:3001/api/interactions
```

For local development, expose your server with a tunnel (e.g. [ngrok](https://ngrok.com)) and use the public HTTPS URL instead.

### 5. Run the apps

**Terminal 1 — backend** (default port `3001`):

```bash
cd backend
npm start
```

**Terminal 2 — frontend** (default port `3000`):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin credentials you created.

## Environment variables

All variables are documented in [`.env.example`](.env.example). Placeholders only — never commit real secrets.

### Backend (`backend/.env`)

| Variable             | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `PORT`               | Express server port (default `3001`)                     |
| `FRONTEND_URL`       | Frontend origin for CORS (e.g. `http://localhost:3000`)  |
| `DATABASE_URL`       | PostgreSQL connection string                             |
| `JWT_SECRET`         | Secret used to sign admin JWT tokens                     |
| `DISCORD_APP_ID`     | Discord application ID                                   |
| `DISCORD_TOKEN`      | Discord bot token                                        |
| `DISCORD_PUBLIC_KEY` | Discord application public key (hex) for request verification |
| `SLACK_WEBHOOK_URL`  | Slack incoming webhook URL for activity mirroring        |

### Frontend (`frontend/.env`)

| Variable        | Description                                      |
| --------------- | ------------------------------------------------ |
| `VITE_API_URL`  | Backend API base URL (e.g. `http://localhost:3001/api`) |

## Deployment

This project is split into two deployable units: the **Express API** (Discord interactions + dashboard API) and the **Vite/React frontend**.

> Replace the placeholder URLs below with your live deployment URLs.

### Recommended layout

| Component  | Suggested platform | Purpose                          |
| ---------- | ------------------ | -------------------------------- |
| Backend    | Render / Railway / Fly.io | Express API + Discord webhook |
| Frontend   | Vercel / Netlify   | Static React dashboard           |
| Database   | Neon / Supabase / RDS | PostgreSQL                  |

### Backend

1. Deploy the `backend/` directory as a Node.js web service.
2. Set all backend environment variables from `.env.example`.
3. Set `FRONTEND_URL` to your deployed frontend URL (e.g. `https://your-app.vercel.app`).
4. In the Discord Developer Portal, set **Interactions Endpoint URL** to:
   ```
   https://your-api.example.com/api/interactions
   ```
5. Re-run `node src/scripts/registerCommands.js` if commands are not already registered.

Health check: `GET /health` → `{ "status": "ok" }`

### Frontend

1. Deploy the `frontend/` directory.
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set `VITE_API_URL` to your deployed backend API URL, e.g.:
   ```
   https://your-api.example.com/api
   ```

### Live URLs (fill in after deployment)

| Service   | URL |
| --------- | --- |
| Dashboard | `https://your-frontend.example.com` |
| API       | `https://your-api.example.com` |
| Discord   | Interactions → `https://your-api.example.com/api/interactions` |

## Project structure

```
Assesment/
├── backend/
│   └── src/
│       ├── controller/   # Auth, dashboard, Discord interactions
│       ├── middleware/   # JWT auth, Discord signature verification
│       ├── routes/       # /api/auth, /api/dashboard
│       ├── DB/           # PostgreSQL pool
│       └── scripts/      # registerCommands, createAdmin
├── frontend/
│   └── src/
│       ├── pages/        # Dashboard, Reports, Logs, Settings, Login
│       ├── components/   # Shared UI
│       └── services/     # API clients
└── .env.example
```

## License

ISC
