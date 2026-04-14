# E-COM – Production E-commerce + Admin Panel

This project uses a split deployment:
- **Frontend (Vite/React)** on Vercel.
- **Backend (Express/MongoDB)** on Render/Railway.

Admin login calls `POST /api/auth/login` on your backend URL.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev:all
```

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## Environment Variables

Use `.env.example` as your baseline.

### Backend (Render/Railway)
Required:
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` (your Vercel URL; can be comma-separated)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Recommended:
- `NODE_ENV=production`
- `PORT=5000` (Render/Railway may override)
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

### Frontend (Vercel)
Required:
- `VITE_API_BASE_URL=https://<your-backend-domain>/api`

> Example: `https://e-com-api.onrender.com/api`

## Deployment

### 1) Backend first (Render or Railway)

#### Render (Blueprint optional)
This repo includes `render.yaml` for backend service creation.

Manual Render settings:
- **Root directory**: `backend`
- **Build command**: `npm install`
- **Start command**: `npm start`
- **Health check path**: `/api/health`

Railway equivalent:
- Deploy from `backend/`
- Start command: `npm start`
- Add the same backend environment variables.

### 2) Frontend on Vercel
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Set env var: `VITE_API_BASE_URL=https://<your-backend-domain>/api`

## API Checks

After deployment, verify:

```bash
curl https://<your-backend-domain>/api/health
```

Expected JSON contains `ok: true`.

```bash
curl -X POST https://<your-backend-domain>/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

Expected: token + user object (or a clear JSON error message if credentials are wrong).

## Why "Network Error" happens in admin login

Usually one of these:
- `VITE_API_BASE_URL` missing or still pointing to localhost.
- Backend not deployed or sleeping/down.
- Backend CORS does not include Vercel domain in `CLIENT_URL`.

The current code now reports clearer errors for these cases.
