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

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend `backend/.env`
Copy backend sample:

```bash
cp backend/.env.example backend/.env
```

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

