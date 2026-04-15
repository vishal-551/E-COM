# E-COM

Production-ready MERN e-commerce monorepo with a single architecture:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT
- **Uploads:** Multer (memory) + Cloudinary

> This repo intentionally does **not** use Supabase.

## 1) Repository Structure

- `src/` — React frontend (store + admin UI)
- `backend/` — Express API, auth, models, upload pipeline
- `.env.example` — frontend env template
- `backend/.env.example` — backend env template
- `vercel.json` — SPA routing for Vercel deployment
- `render.yaml` — Render blueprint for backend deployment

## 2) Environment Variables

### Frontend (`.env`)

Copy from template:

```bash
cp .env.example .env
```

Required:

- `VITE_API_BASE_URL` (must include `/api`)

Examples:

- Local: `VITE_API_BASE_URL=http://localhost:5000/api`
- Production: `VITE_API_BASE_URL=https://api.yourdomain.com/api`

### Backend (`backend/.env`)

Copy from template:

```bash
cp backend/.env.example backend/.env
```

Required:

- `MONGO_URI`
- `JWT_SECRET`
- One of `CLIENT_URL` or `CLIENT_URLS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:

- `JWT_EXPIRES_IN` (default `7d`)
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## 3) Local Development Setup

1. Install frontend dependencies:

   ```bash
   npm install
   ```

2. Install backend dependencies:

   ```bash
   npm run backend:install
   ```

3. Create env files and fill values:

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

4. Start MongoDB locally (or use Atlas):

   ```bash
   # Example for local MongoDB service names (use the one your OS provides)
   sudo systemctl start mongod || sudo systemctl start mongodb
   ```

5. Run frontend + backend together:

   ```bash
   npm run dev:all
   ```

6. Verify backend health + CORS:

   ```bash
   curl http://localhost:5000/api/health
   curl -i -H "Origin: http://localhost:5173" http://localhost:5000/api/health
   ```

   The second command should return `Access-Control-Allow-Origin: http://localhost:5173` when `CLIENT_URL`/`CLIENT_URLS` is configured correctly.

If `/api/health` returns `503`, start MongoDB or switch `MONGO_URI` to Atlas, then wait for reconnect.

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

## 4) Seed Admin Setup

Option A: auto-seed on backend startup

- Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `backend/.env`.
- Optionally set `SEED_ADMIN_NAME`.

Option B: run seed command manually

```bash
npm run seed:admin
```

## 5) Frontend Deployment (Vercel)

1. Push repo to GitHub.
2. In Vercel, import the repo.
3. Configure project:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-api-domain>/api`
5. Deploy.
6. Confirm frontend can call backend health via browser/API client.

## 6) Backend Deployment (Render / Railway / VPS)

### Render

- This repo includes `render.yaml` configured for:
  - `rootDir: backend`
  - `buildCommand: npm install`
  - `startCommand: npm run start`
  - health check: `/api/health`

Set backend env vars in Render dashboard:

- `NODE_ENV=production`
- `PORT=5000` (or platform default)
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` and/or `CLIENT_URLS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- Optional seed vars (`SEED_ADMIN_*`)

### Railway / VPS

From `backend/`:

- Install: `npm install`
- Start: `npm run start`

Ensure the same environment variables are configured.

## 7) MongoDB Atlas Setup

1. Create Atlas cluster.
2. Create database user (read/write on app DB).
3. In **Network Access**, allow backend host IP(s) (or `0.0.0.0/0` temporarily during setup).
4. Get connection string and set:
   - `MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority`
5. Restart backend and verify `/api/health` returns `ok: true`.

## 8) Cloudinary Setup

1. Create Cloudinary account.
2. Copy credentials from dashboard:
   - cloud name
   - API key
   - API secret
3. Set backend env:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Test admin upload from UI (`/api/upload/single`).

Notes:

- Uploads use Multer memory storage + direct Cloudinary upload stream.
- No local disk dependency for production media.

## 9) CORS + Custom Domain Flow

Supported deployment patterns:

1. **Local FE + Local BE**
   - `CLIENT_URL=http://localhost:5173`
   - `VITE_API_BASE_URL=http://localhost:5000/api`

2. **Vercel FE + Hosted BE**
   - `CLIENT_URL=https://<your-vercel-domain>`
   - `VITE_API_BASE_URL=https://<backend-domain>/api`

3. **Custom FE domain + API subdomain**
   - `CLIENT_URL=https://www.yourdomain.com`
   - or `CLIENT_URLS=https://www.yourdomain.com,https://yourdomain.com`
   - `VITE_API_BASE_URL=https://api.yourdomain.com/api`

If you run staging + production in parallel, use `CLIENT_URLS` as comma-separated allowlist.

## 10) Health + Monitoring Basics

- Health endpoint: `GET /api/health`
- Returns service uptime, environment, DB state, and status.
- Returns `503` if database is not ready.
- Startup validates required env variables and exits with clear errors if invalid.

## 11) Security Notes

- Passwords are hashed with bcrypt before saving.
- JWT-based route protection enforced via middleware.
- Admin routes require `admin` or `editor` role.
- Production error responses avoid leaking internal stack traces.
- Forgot-password endpoint does not expose raw reset tokens in production.
- Frontend only consumes `VITE_*` public variables; backend secrets are server-side only.

## 12) Build / Run Commands

Root scripts:

- `npm run dev` — frontend dev
- `npm run build` — frontend build
- `npm run preview` — frontend preview build
- `npm run start` — backend production start (from root wrapper)
- `npm run dev:all` — frontend + backend dev in one terminal
- `npm run backend:install` — install backend dependencies
- `npm run backend:dev` — backend dev mode (`node --watch`)
- `npm run backend:start` — backend production mode
- `npm run seed:admin` — run admin seed script
- `npm run install:all` — install frontend and backend dependencies

Backend scripts:

- `npm run dev`
- `npm run start`
- `npm run seed:admin`

## 13) Preview / Test URLs After Deploy

- Frontend: `https://<frontend-domain>`
- Backend health: `https://<api-domain>/api/health`
- API base used by frontend: `https://<api-domain>/api`
