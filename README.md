# E-COM – Production-Ready E-commerce + Admin Panel

This project now uses a real JWT-secured admin system with MongoDB-backed CRUD, Cloudinary uploads, and API-driven admin pages.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev:all
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## Environment Variables

Use `.env.example` as baseline.

Required:
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `VITE_API_BASE_URL`

Optional admin seeding:
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Admin Features Implemented

- Real admin JWT login (`/api/auth/login`) with route guard and `/admin/login` redirect.
- Full products CRUD with search/filter/pagination and Cloudinary thumbnail/gallery upload.
- Full orders management with status workflow, payment status, dispatch/tracking details, and status history timeline.
- Analytics dashboard from real DB data.
- Users management: list/search/block/unblock/delete + order count.
- Banner management with Cloudinary image cleanup.
- Enquiry management: list/search/filter/read/unread/delete.
- Coupon CRUD (code, type, value, min order, expiry, active state).
- Settings/content management for home/footer/about/promo/social links.

## API Routes

Base URL: `/api`

- Auth: `POST /auth/login`, `POST /auth/signup`, `GET /auth/profile`
- Products: `GET/POST /products`, `GET/PUT/DELETE /products/:id`
- Orders: `POST /orders`, `GET /orders`, `GET /orders/mine`, `PATCH /orders/:id/status`
- Users: `GET /users`, `PATCH /users/:id/block`, `DELETE /users/:id`
- Banners: `GET/POST /banners`, `PUT/DELETE /banners/:id`
- Contact: `POST /contact`, `GET /contact`, `PATCH /contact/:id/read`, `DELETE /contact/:id`
- Coupons: `GET/POST /coupons`, `PUT/DELETE /coupons/:id`
- Settings: `GET/PUT /settings`
- Analytics: `GET /admin/analytics`
- Uploads: `POST /upload/single`, `POST /upload/multiple`, `DELETE /upload/:publicId`

## Deployment

### Frontend (Vercel)
1. Import repo.
2. Build command: `npm run build`
3. Output: `dist`
4. Env: `VITE_API_BASE_URL=https://<backend-domain>/api`

### Backend (Render/Railway)
1. New web service from repo.
2. Start command: `npm run server`
3. Add all backend env vars from `.env.example` (except `VITE_API_BASE_URL` unless same container).
4. Set `CLIENT_URL` to your frontend domain.

## Seed Admin

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before starting backend; if user does not exist it is auto-created with role `admin`.
