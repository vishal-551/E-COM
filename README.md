# E-COM – Supabase Powered Production E-commerce

This project now runs as a **single Vite frontend** with Supabase as backend for:
- Postgres database
- Auth (customer + admin)
- Storage (products / banners / categories)
- RLS and role-based access

## Required environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 1) Supabase setup

1. Create a new Supabase project.
2. Open SQL editor and run `supabase/migrations/20260414_init_ecom.sql`.
3. In **Storage**, create buckets:
   - `products` (public)
   - `banners` (public)
   - `categories` (public)
4. In **Auth > URL Configuration**, set site URL to your Vercel URL and add `http://localhost:5173` in redirect URLs.

## 2) Create first admin user

1. Sign up from `/signup` or Auth dashboard.
2. In SQL editor run:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

3. Login from `/admin/login`.

## 3) Local run

```bash
npm install
npm run dev
```

## 4) Vercel deployment

1. Import repo to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

## Functional checklist

- Admin auth with role guard: `/admin/login`, `/admin/*`
- Customer auth: `/login`, `/signup`, reset-password email flow
- Product CRUD + category CRUD + image upload to storage
- Cart/wishlist persisted in DB (not localStorage)
- Checkout creates orders + order_items + coupon support
- Admin order status and dispatch detail updates
- Enquiry submit and admin read/delete
- Banner and settings CMS
- Dashboard analytics with real DB counts/sales

## Important routes

Customer:
- `/`
- `/login`
- `/signup`
- `/profile`
- `/cart`
- `/checkout`
- `/orders`

Admin:
- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/users`
- `/admin/banners`
- `/admin/enquiries`
- `/admin/coupons`
- `/admin/settings`
- `/admin/categories`
