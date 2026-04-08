# E-COM – Full Stack E-commerce + Admin Panel

A professional-ready e-commerce starter with:
- **Frontend:** React + Tailwind (glassmorphism + dark neon admin feel)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** JWT (signup/login/profile + admin guard)
- **Admin:** Product, banner/media, offers, social/content, enquiries, users, analytics
- **Deployment-ready:** Vercel (frontend) + Render/Railway (backend)

---

## 1) Quick Start

```bash
npm install
npm run dev
```

Run backend API:

```bash
npm run server
```

Run frontend + backend together:

```bash
npm run dev:all
```

---

## 2) Environment Configuration

Create `.env` in project root:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ecom
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional first admin seed
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@123
```

> For Cloudinary, upload images externally and store URL in product/banner media fields.

---

## 3) Feature Coverage

### User features
- Home banners (admin controlled), categories, featured/new products, offers.
- Product listing with **category + min/max price filters**.
- Product details, add-to-cart, wishlist.
- Cart quantity update/remove + totals.
- Checkout form and order creation.
- Signup/Login (JWT demo in UI + real JWT API routes).
- Profile page.
- Contact enquiry form.

### Admin panel features
- **Product management:** create/delete + image preview + multi-image storage field.
- **Banner/media control:** add homepage banners + hero/thumbnail URLs.
- **Offers management:** percentage/fixed offers tied to category/product.
- **Social/content management:** update homepage text, footer text, about/social links.
- **Enquiry management:** view all enquiries and mark read/unread.
- **User management:** view users, block/unblock, delete.
- **Dashboard analytics:** total users, orders, revenue, recent activity.
- **Security:** protected admin route (frontend) + JWT auth + admin middleware (backend).

---

## 4) API Endpoints (Backend)

Base URL: `http://localhost:5000/api`

- Auth: `/auth/signup`, `/auth/login`, `/auth/profile`
- Products: `/products` (GET/POST/PUT/DELETE)
- Categories: `/categories`
- Orders: `/orders`, `/orders/mine`, `/orders/:id/status`
- Users (admin): `/users`, `/users/:id/block`, `/users/:id`
- Contact: `/contact`, `/contact/:id/read`
- Banners: `/banners`
- Offers/Coupons: `/coupons`
- Settings/Content: `/settings`
- Admin Analytics: `/admin/analytics`
- Upload passthrough: `/upload`

---

## 5) Deployment Guide

### Frontend (Vercel)
1. Import repo in Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env if needed: `VITE_API_BASE_URL=https://your-backend-url`

### Backend (Render/Railway)
1. Create new Web Service from repo.
2. Start command: `npm run server`
3. Add all `.env` variables from section 2.
4. Set allowed frontend in `CLIENT_URL`.

---

## 6) Notes

- Frontend currently uses local state/localStorage for instant demo UX.
- Backend is fully implemented and can be wired to frontend API calls incrementally.
- Admin token demo key in frontend: `aaj_admin_token`.
