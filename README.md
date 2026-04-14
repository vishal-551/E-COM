# NovaCraft Agency - Production Ready Portfolio + Admin CMS

Full-stack business website built with:
- Frontend: React + Vite + Tailwind + Axios
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT admin auth
- Uploads: Multer + Cloudinary

## Features

### Public Website
- Home, About, Services, Projects, Project Detail, Blog, Blog Detail, Contact, Request Quote, FAQ
- Testimonials and Team sections
- Working forms: Contact, Quote, Newsletter (stored in MongoDB)
- SEO-friendly slugs for project/blog URLs
- Responsive layout

### Admin Panel
- Admin login/logout with JWT
- CRUD for Services, Projects, Blog Posts, Testimonials, Team Members, Site Settings
- Manage contact enquiries, quote requests, newsletter submissions
- Protected admin routes

### Backend Architecture
- Config (`backend/config`)
- Models (`backend/models`)
- Controllers (`backend/controllers`)
- Routes (`backend/routes`)
- Middleware (`backend/middleware`)
- Centralized error handling (`backend/utils/error.js`)

## Folder Structure

```
.
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── .env.example
│   └── server.js
├── src
│   ├── components
│   ├── context
│   ├── pages
│   │   └── admin
│   ├── utils
│   ├── App.jsx
│   └── main.jsx
├── .env.example
└── package.json
```

## Environment Variables

### Frontend `.env`
Copy `.env.example`:

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

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend `backend/.env`
Copy backend sample:

```bash
cp backend/.env.example backend/.env
Fill all values in `.env`.

## Run (local)
```bash
npm run dev:all
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Set MongoDB Atlas + Cloudinary credentials.

## Local Setup

```bash
npm install
npm run backend:install
npm run server
# in another terminal
npm run dev
```

Or run together:

```bash
npm run dev:all
```

## Admin Setup

1. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `backend/.env`.
2. Start backend once; seed admin is auto-created if missing.
3. Login at `/admin/login`.

## API Base URL Handling

Frontend uses `src/utils/api.js` and reads `VITE_API_BASE_URL`.
Fallback for local is `http://localhost:5000/api`.

## Deployment

### Frontend (Vercel)
1. Import repository.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_BASE_URL` to deployed backend URL + `/api`

### Backend (Render/Railway/VPS)
1. Deploy `backend` service with `npm install && npm start`
2. Add all vars from `backend/.env.example`
3. Set `CLIENT_URL` to frontend domain
4. Ensure MongoDB Atlas network/IP allows backend

### Domain-ready notes
- Point domain DNS to Vercel (frontend)
- Use API subdomain (e.g., `api.yourdomain.com`) for backend
- Configure CORS `CLIENT_URL` with production frontend URL
- Enable HTTPS on both services

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
