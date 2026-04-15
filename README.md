# E-COM (React + Express + MongoDB)

Production-style e-commerce project with customer storefront, JWT auth, cart/wishlist persistence, checkout/order APIs, and admin management screens.

## Stack
- Frontend: React + Vite + Tailwind + Axios
- Backend: Node.js + Express + Mongoose
- Database: MongoDB (Atlas or local)
- Media: Multer memory upload + Cloudinary
- Auth: JWT bearer tokens

## Monorepo Layout
- `src/` customer + admin frontend routes
- `backend/` API, models, middleware, and scripts
- `.env.example` frontend env template
- `backend/.env.example` backend env template

## Local Setup
```bash
npm install
npm run backend:install
cp .env.example .env
cp backend/.env.example backend/.env
```

## Run
```bash
npm run dev:all
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

## Core flows covered
- Customer: product list/details, signup/login, cart CRUD, wishlist, coupon apply, checkout, order-success, order history.
- Admin: login, protected admin routes, analytics, product/category/banner CRUD, enquiry management, coupon CRUD, order status updates, user list/block, settings content, media upload library.

## Seed Admin
Set in `backend/.env`:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Then either start backend (auto-seed if not present) or run:
```bash
npm run backend:seed:admin
```

## Deploy
### Frontend (Vercel)
- Build command: `npm run build`
- Output dir: `dist`
- Env: `VITE_API_BASE_URL=https://<backend-domain>/api`

### Backend (Render/Railway/VPS)
- Root: `backend`
- Build: `npm install`
- Start: `npm run start`
- Env: all keys from `backend/.env.example`

## Core APIs
- Auth: `/api/auth/*`
- Products: `/api/products`
- Categories: `/api/categories`
- Cart: `/api/cart`
- Wishlist: `/api/wishlist`
- Orders: `/api/orders`
- Admin analytics: `/api/admin/analytics`
