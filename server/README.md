# Synapse Data API

This service stores Synapse app data in MySQL. It is separate from the FastAPI AI backend:

- FastAPI on `8001`: AI analysis, extraction, tutor, quizzes, timelines, generated assets.
- Express data API on `3001`: users, generated content records, study rooms, focus sessions, flashcards, progress.

The frontend calls this API over HTTP. It never connects directly to MySQL.

## Local Setup

Install dependencies from this folder:

```bash
cd server
npm install
```

If your terminal says `npm: command not found`, load the project-local Node helper from the project root first:

```bash
cd /Users/zhenghui/Desktop/Synapse-ai-study-assistant
source scripts/use_local_node.sh
cd server
npm install
```

Run the `source` command again in each new terminal tab before using `npm`.

Create a local MySQL database and app user. If the MySQL CLI is available:

```sql
CREATE DATABASE IF NOT EXISTS synapse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'synapse_app'@'localhost' IDENTIFIED BY 'replace_with_a_strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER, REFERENCES ON synapse.* TO 'synapse_app'@'localhost';
FLUSH PRIVILEGES;
```

On this Mac the MySQL CLI may be available as `/usr/local/mysql/bin/mysql` even when `mysql` is not on `PATH`.

Copy the env template and fill in your real local password:

```bash
cp .env.example .env
```

Run the schema with Node/mysql2, not the MySQL CLI:

```bash
npm run db:setup
```

To clear local test accounts and generated app data from MySQL:

```bash
npm run db:reset
```

Start the data API:

```bash
npm run dev
```

Check health:

```bash
curl http://127.0.0.1:3001/health
```

## FastAPI Mirroring

Set the same internal token in both places:

```env
# server/.env
SYNAPSE_INTERNAL_API_TOKEN=long_random_value

# backend/.env
SYNAPSE_DATA_API_INTERNAL_URL=http://127.0.0.1:3001
SYNAPSE_INTERNAL_API_TOKEN=long_random_value
```

If this token is missing or the data API is down, FastAPI still returns generated notes to the frontend. Durable MySQL save is skipped and logged.

## Frontend Config

For local development the frontend defaults to:

```js
window.SYNAPSE_DATA_API_BASE = "http://127.0.0.1:3001";
```

For production, set this to your deployed data API URL in `frontend/config.js` or injected runtime config. Do not put MySQL host, username, or password in frontend files.

## Production Notes

- Use a managed MySQL database or a secured private MySQL server.
- Set `ALLOW_LOCAL_DEMO_AUTH=false` before accepting real accounts.
- Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` for bearer-token verification.
- Restrict `SYNAPSE_DATA_CORS_ORIGINS` to deployed frontend origins.
- Store all secrets in the platform secret manager.
- Use TLS between public clients and the API; keep MySQL private.
