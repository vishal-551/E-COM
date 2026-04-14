# Production-Ready E-Commerce (React + Node + MongoDB)

Full-stack deployable e-commerce application with real backend APIs, JWT auth, MongoDB persistence, Cloudinary uploads, and admin panel.

## Tech Stack
- Frontend: React + Vite + Tailwind + Axios
- Backend: Node.js + Express + Mongoose
- Database: MongoDB Atlas / local MongoDB
- Auth: JWT + bcrypt
- Uploads: Multer + Cloudinary

## Folder Structure
- `src/` Frontend app (customer + admin UI)
- `backend/config` DB + cloudinary config
- `backend/models` Mongoose models
- `backend/routes` API routes
- `backend/controllers` auth controller
- `backend/middleware` auth + upload middleware
- `backend/utils` error + token utils
- `backend/scripts/seedAdmin.js` seed first admin

## Setup
```bash
npm install
npm run backend:install
cp .env.example .env
```

Fill all values in `.env`.

## Run (local)
```bash
npm run dev:all
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Seed First Admin
```bash
npm --prefix backend run seed:admin
```

## Deploy
### Frontend (Vercel)
- Set build command: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://<your-backend-domain>/api`

### Backend (Render/Railway/VPS)
- Start command: `npm --prefix backend start`
- Env: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, Cloudinary vars

### Database
- Use MongoDB Atlas connection in `MONGO_URI`.

### Images
- Cloudinary stores product thumb/gallery and banners.

## Features Implemented
### Customer
- Homepage, category, shop, product details
- Search/sort in listing
- Cart + wishlist persisted in MongoDB
- JWT signup/login/profile
- Forgot/reset password token flow
- Checkout with shipping/payment/coupon
- Order history + tracking fields
- Contact and about pages

### Admin
- Admin login/guard
- Dashboard analytics
- Product/category/banner/coupon CRUD
- Order management + status updates
- User and enquiry management
- Settings management
- Cloudinary image uploads

## API Health
- `GET /api/health`
