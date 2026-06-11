# Synapse AI Study Assistant

Synapse is an AI-powered study website and workspace that turns PDFs, lecture slides, videos, images, links, and notes into active learning: structured notes, mind maps, questions, flashcards, timelines, source previews, and tutor feedback.

## Project Structure

- `frontend/` - static public website, auth prototype pages, and the study workspace shell.
- `frontend/src/` - React shell plus the existing legacy controller modules.
- `backend/` - FastAPI backend for analysis, tutoring, quizzes, flashcards, source previews, contact enquiries, and generated assets.
- `server/` - Express + MySQL data API for users, generated content records, study rooms, focus sessions, flashcards, and progress.
- `logos/` and `frontend/logos/` - Synapse logo assets for local root serving and static frontend publishing.
- `scripts/validate_static_site.mjs` - launch-readiness validation for static HTML.
- `deploy/` - production runtime notes and service templates.

## Install

Create and activate a Python virtual environment, then install the backend dependencies:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
```

Install the frontend toolchain from the project root:

```bash
npm install
```

Node is used for the Vite frontend build/dev server and the regression checks.

If `node` or `npm` is not available in your terminal, use the project-local Node helper:

```bash
source scripts/use_local_node.sh
node --version
npm --version
```

Run the `source` command in each new terminal tab before using `npm`; it only updates that terminal session.

## Environment Variables

Create `backend/.env` for local backend secrets:

```env
OPENAI_API_KEY=your_key_here
SYNAPSE_PUBLIC_BACKEND_URL=http://127.0.0.1:8001
SYNAPSE_CORS_ALLOW_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
ENABLE_LOCAL_PPTX_APP_RENDER=false
ENABLE_SOURCE_PPTX_PREVIEW_RENDER=true
```

Optional contact/email delivery:

```env
SYNAPSE_CONTACT_WEBHOOK_URL=https://your-form-or-email-webhook.example/contact
```

Production auth and billing:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_STUDENT=price_...
STRIPE_PRICE_PRO=price_...
SYNAPSE_FRONTEND_BASE_URL=https://your-frontend-domain.com
# Local webhook testing only:
SYNAPSE_ALLOW_UNSIGNED_STRIPE_WEBHOOK=false
```

The landing page reads `window.SYNAPSE_CONTACT_ENDPOINT` when you want to post contact enquiries to a specific deployed endpoint. If it is not set, localhost submissions try `http://127.0.0.1:8001/contact`; otherwise they are saved locally for launch testing.

The auth pages use Supabase Auth when `window.SYNAPSE_SUPABASE_URL` and `window.SYNAPSE_SUPABASE_ANON_KEY` are configured. Without those public frontend values, the older browser-local demo auth remains available for development only.

The MySQL data API is configured separately in `server/.env`. Keep `MYSQL_PASSWORD` and `SYNAPSE_INTERNAL_API_TOKEN` out of frontend files and Git. See `server/README.md` for local MySQL setup.

Edit or replace `frontend/config.js` during deployment with your public backend, Supabase, and Stripe Price ID values. `frontend/config.example.js` shows the same shape with filled example placeholders.

## Run Locally

Start the backend:

```bash
.venv/bin/python run_backend.py
```

Start the Vite frontend:

```bash
npm run dev
```

Start the MySQL data API in another terminal when you want durable app data:

```bash
cd server
npm install
npm run db:setup
npm run dev
```

Open the public site:

```text
http://127.0.0.1:5173/frontend/landing.html
```

Open the study workspace:

```text
http://127.0.0.1:5173/frontend/index.html
```

Open the standalone Focus Room:

```text
http://127.0.0.1:5173/frontend/focus-room.html#/focus-room/:materialId
```

The project-root `index.html` redirects to the public landing page. `app.html` redirects to the study workspace.

## Validate And Test

Run the static launch validation:

```bash
node scripts/validate_static_site.mjs
```

Run frontend regression scripts:

```bash
npm run test:focus-room
```

Build the Vite frontend:

```bash
npm run build
```

Run backend tests:

```bash
.venv/bin/python -m unittest backend.tests.test_visual_gallery_and_cache
```

The Vite build writes `dist/`; keep static validation and regression checks in the release gate because the app still preserves several direct HTML entry points.

## Deploy

For a static-only marketing launch, publish `frontend/` as the static directory and use `landing.html` as the public entry page. If your host requires `index.html` as the entry page, deploy from the project root or configure a route/redirect from `/` to `/landing.html`.

For the full Synapse app, deploy both parts:

1. Host `frontend/` as static files.
2. Deploy `backend.app:app` as a FastAPI service.
3. Set `window.SYNAPSE_API_BASE` in production HTML or a small injected config script.
4. Set `window.SYNAPSE_CONTACT_ENDPOINT` to the deployed contact endpoint, for example `https://api.your-domain.com/contact`.
5. Set `window.SYNAPSE_SUPABASE_URL`, `window.SYNAPSE_SUPABASE_ANON_KEY`, and Stripe public Price IDs in frontend config.
6. Configure backend CORS with the deployed frontend origin.
7. Store all secrets in the hosting platform, never in Git.

Recommended backend command:

```bash
.venv/bin/python -m uvicorn backend.app:app --host 0.0.0.0 --port 8001
```

For PPTX source previews in production, install LibreOffice and configure:

```env
LIBREOFFICE_PATH=/usr/bin/libreoffice
SOURCE_PREVIEW_RENDER_DPI=120
SOURCE_PREVIEW_PPTX_CONVERT_TIMEOUT=120
SOURCE_PREVIEW_MAX_SLIDES=80
SOURCE_PREVIEW_MAX_PDF_PAGES=160
```

See `deploy/README.md` for service templates and backend runtime notes.

## Launch Checklist

- Static validation passes.
- Backend tests pass.
- Public landing page opens from the deployed root URL.
- Navigation links scroll or route correctly.
- Contact form posts to a deployed endpoint or is intentionally disabled until email delivery is configured.
- `OPENAI_API_KEY`, CORS origins, public backend URL, and contact webhook are set in production.
- Supabase Auth URL, anon key, and service role key are configured before accepting real user accounts.
- Stripe secret key, webhook secret, and Price IDs are configured before charging for credit packs.
- Stripe webhook route `/billing/webhook` is registered in the Stripe dashboard.
- Account deletion and export are tested with a real Supabase test user before launch.
- Privacy Policy and Terms are reviewed for your jurisdiction and actual data processors.
- Mobile, tablet, and desktop layouts are manually checked.
- Browser console is free of launch-blocking errors.
- Uploaded study source flow is tested against the deployed backend.
