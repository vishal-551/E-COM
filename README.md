# Khushi Jewallary - Premium E-commerce Demo

A complete **static but functional** React + Vite + Tailwind artificial jewellery store demo with localStorage persistence and backend-ready architecture.

## Setup

```bash
npm install
npm run dev
```

## Tech
- React + Vite + Tailwind CSS
- React Router
- localStorage state persistence
- Backend-ready `backend/` scaffold for Node/Express/MongoDB

## Folder Structure

- `src/components` reusable UI blocks
- `src/pages` storefront + utility pages
- `src/pages/admin` admin panel pages
- `src/context/StoreContext.jsx` central state (products/cart/wishlist/orders/settings)
- `src/data/products.js` products, categories, banners, coupons, testimonials
- `backend/` API/model scaffolding

## Content Update Guide

- Change logo/store name/contact/social: `src/context/StoreContext.jsx` (settings object)
- Change products: `src/data/products.js` (productsSeed)
- Change banners: `src/data/products.js` (bannersSeed) or admin banner page
- Change categories: `src/data/products.js` (categoriesSeed) or admin categories page
- Change admin credentials simulation: `src/pages/admin/AdminPages.jsx` (`AdminLoginPage` localStorage gate)

## Demo Admin
- Login URL: `/admin/login`
- Demo mode uses localStorage token `aaj_admin=1`

## Notes
- Static demo supports product listing, search/sort, cart, wishlist, checkout, contact enquiries, and admin product/category/banner/coupon/settings updates.
- Backend-ready Express skeleton available in `backend/` for future integration.
