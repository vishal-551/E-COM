# SaaSCore - Production-Ready Admin Dashboard SaaS

A full-stack SaaS/admin dashboard built with:
- Frontend: **React + Vite + Tailwind + Axios**
- Backend: **Node.js + Express + MongoDB + Mongoose**
- Auth: **JWT + bcrypt**
- Authorization: **Role + permission based**

---

## Full Project Structure

```txt
.
├── backend
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/admin.js
│   ├── utils/
│   ├── package.json
│   └── server.js
├── src
│   ├── api/client.js
│   ├── components/common/
│   ├── components/layout/
│   ├── context/AuthContext.jsx
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
└── vercel.json
```

---

## Features Completed

### Public SaaS Pages
- Landing page
- Pricing page
- Login / Signup
- Forgot password

### Core App Modules
- Dashboard overview cards
- Analytics charts (revenue/users/orders/leads)
- User management (list/search/filter/delete/block)
- Team management (invite/create role-based accounts)
- Settings modules (app/profile/company/branding/notifications/security categories)
- Notifications center
- Activity logs module
- Profile page
- Contact/support ticket form

### Security + Auth
- JWT authentication
- Password hashing with bcrypt
- Protected backend routes
- Frontend protected routes
- Role + permission enforcement in frontend and backend
- CORS and centralized API protections
- Centralized error handling

### SaaS/Subscription-Ready Structure
- `User.subscription` fields for plan, status, expiry
- Role and permission model support

---

## Environment Variables

Copy env file:

```bash
cp .env.example .env
```

Set:
- `VITE_API_BASE_URL`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

---

## Local Run Commands

Install dependencies:

```bash
npm install
npm install --prefix backend
```

Run frontend + backend:

```bash
npm run dev:all
```

Frontend only:

```bash
npm run dev
```

Backend only:

```bash
npm run backend:dev
```

---

## Admin Seed Method

```bash
npm run backend:seed:admin
```

Uses:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

---

## Deployment Steps

### Frontend (Vercel)
1. Import repository into Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set env variable: `VITE_API_BASE_URL=https://your-api-domain.com/api`

### Backend (Render / Railway / VPS)
1. Deploy `backend/` as Node service.
2. Build/install: `npm install`
3. Start command: `npm run start`
4. Add env vars from `.env.example`.
5. Point `MONGO_URI` to MongoDB Atlas cluster.
6. Set `CLIENT_URL` to your frontend domain.

### Domain-ready architecture
- Frontend domain: `https://app.yourdomain.com`
- Backend API domain: `https://api.yourdomain.com`
- Configure CORS with `CLIENT_URL`.

---

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET/POST/PATCH/DELETE /api/users`
- `GET /api/dashboard/overview`
- `GET /api/dashboard/analytics`
- `GET/POST /api/settings`
- `GET/PATCH /api/notifications`
- `GET /api/activity-logs`
- `POST/GET/PATCH /api/support`

