# E-COM

Production-minded full-stack e-commerce monorepo with a clean, single architecture:

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT
- **Uploads:** Multer (memory storage) + Cloudinary

> This repository intentionally does **not** use Supabase.


## Architecture Consistency

- Active stack is **React + Vite**, **Node.js + Express**, **MongoDB + Mongoose**, **JWT**, and **Multer + Cloudinary**.
- No Supabase runtime or migration layer is used in this repository.

## Project Structure

- `src/` — React storefront + admin frontend
- `backend/` — Express API, models, routes, middleware, seed script
- `.env.example` — frontend env template
- `backend/.env.example` — backend env template
- `vercel.json` — frontend deployment routing
- `render.yaml` — backend deployment blueprint for Render

## Environment Files

Create env files from templates:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend `backend/.env`

Required in all environments:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:

- `CLIENT_URLS` (comma-separated allowlist for multiple origins)
- `JWT_EXPIRES_IN` (default `7d`)
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Local Setup (Run-Readiness Flow)

1. Install root dependencies:

   ```bash
   npm install
   ```

2. Install backend dependencies:

   ```bash
   npm run backend:install
   ```

3. Copy env templates and fill values:

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

4. Start frontend + backend together:

   ```bash
   npm run dev:all
   ```

5. Verify backend health:

   ```bash
   curl http://localhost:5000/api/health
   ```

## Local Preview URLs

- Frontend: `http://localhost:5173`
- Backend API root: `http://localhost:5000`
- Backend health route: `http://localhost:5000/api/health`

## NPM Scripts

### Root scripts

- `npm run dev` — start Vite dev server
- `npm run build` — build frontend
- `npm run preview` — preview built frontend
- `npm run backend:install` — install backend dependencies
- `npm run backend:dev` — run backend in watch mode
- `npm run backend:start` — run backend in standard mode
- `npm run backend:seed:admin` — seed admin from backend env values
- `npm run seed:admin` — alias for backend seed command
- `npm run dev:all` — run frontend + backend concurrently
- `npm run install:all` — install root + backend dependencies

### Backend scripts (`backend/package.json`)

- `npm run dev`
- `npm run start`
- `npm run seed:admin`

## Admin Seed Behavior

- The backend can auto-seed an admin user at startup when both `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are provided.
- You can also seed manually with:

```bash
npm run seed:admin
```

## API Summary

- `GET /api/health` — health check
- `POST /api/auth/*` — auth endpoints
- `GET /api/products` — products
- `GET /api/categories` — categories
- `GET /api/banners` — banners
- `POST /api/contact` — contact form
- `GET /api/cart` — cart
- `GET /api/wishlist` — wishlist
- `POST /api/coupons/apply` — coupon validation
- `POST /api/orders` — order placement
- `GET /api/users` — admin user management
- `GET /api/settings` — site settings
- `POST /api/upload/single` — admin image upload to Cloudinary
- `GET /api/admin/analytics` — admin dashboard

## Deployment Summary

### Frontend (Vercel)

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Env var:
  - `VITE_API_BASE_URL=https://<your-backend-domain>/api`

### Backend (Render / Railway / VPS)

- Service root: `backend`
- Build command: `npm install`
- Start command: `npm run start`
- Health check path: `/api/health`
- Set backend env vars from `backend/.env.example`

### Custom Domain

- Point frontend domain/subdomain to Vercel project
- Point API domain/subdomain to backend host (Render/Railway/VPS)
- Update CORS in backend env:
  - `CLIENT_URL=https://<your-frontend-domain>`
  - optionally `CLIENT_URLS` for multiple domains
- Update frontend env:
  - `VITE_API_BASE_URL=https://<your-api-domain>/api`
