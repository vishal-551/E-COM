# E-COM (MongoDB + Express + JWT + Cloudinary + React/Vite)

Clean MERN-style monorepo for storefront + admin management.

## Final Architecture
- **Frontend:** React + Vite + Tailwind + Axios
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT Bearer tokens
- **Uploads:** Multer (memory) + Cloudinary

## Project Structure
- `src/` frontend app (store + admin screens)
- `backend/` Express API, Mongoose models, middleware, scripts
- `.env.example` frontend env template
- `backend/.env.example` backend env template

## Environment Setup
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### Frontend env (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend env (`backend/.env`)
Required keys:
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:
- `CLIENT_URLS`
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Local Install
```bash
npm run install:all
```

## Local Development (Preview Flow)
Run frontend + backend together:
```bash
npm run dev:all
```

Expected local URLs:
- Frontend (Vite): `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

## Scripts
### Root
- `npm run dev` → frontend only
- `npm run build` → frontend production build
- `npm run preview` → frontend preview
- `npm run backend:dev` → backend watch mode
- `npm run backend:start` → backend start mode
- `npm run backend:seed:admin` → seed admin user
- `npm run dev:all` → frontend + backend together
- `npm run install:all` → install root + backend deps

### Backend (`backend/package.json`)
- `npm run dev`
- `npm run start`
- `npm run seed:admin`

## Deployment
### Frontend (Vercel)
- Build command: `npm run build`
- Output directory: `dist`
- Environment:
  - `VITE_API_BASE_URL=https://<your-backend-domain>/api`

### Backend (Render / Railway / VPS)
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm run start`
- Health check path: `/api/health`
- Set all backend env vars from `backend/.env.example`

## API Summary
- Auth: `/api/auth/*`
- Products: `/api/products`
- Categories: `/api/categories`
- Banners: `/api/banners`
- Contact: `/api/contact`
- Cart: `/api/cart`
- Wishlist: `/api/wishlist`
- Coupons: `/api/coupons`
- Orders: `/api/orders`
- Users (admin): `/api/users`
- Settings: `/api/settings`
- Uploads (admin): `/api/upload/*`
- Admin analytics: `/api/admin/analytics`
- Health: `/api/health`
