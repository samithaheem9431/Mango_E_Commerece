# Mango E-Commerce Full Stack

Full-stack mango store with customer storefront and admin panel built using:

- Next.js + Tailwind CSS (frontend)
- Node.js + Express + MongoDB (backend API)
- JWT auth with role-based access

## Project Structure

```text
mango/
  backend/
  frontend/
```

## 1) Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mango_store
JWT_SECRET=replace_with_secure_secret
CLIENT_URL=http://localhost:3000
```

Run backend:

```bash
npm run dev
```

## 2) Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

## 3) Run Both Frontend + Backend (One Command)

From project root:

```bash
cd mango
npm install
npm run both
```

You can also use:

```bash
npm run dev
```

## Demo Accounts

Public registration always creates `customer` accounts only.

To enable secure admin management:

- Set `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in `backend/.env`
- Start backend; it auto-creates (or upgrades) that user to `superadmin`
- Login as superadmin and use Admin Dashboard to create `admin` users

## Features

- Customer storefront (home, products, categories, cart, checkout)
- Quantity selector (0-10), add to cart, total calculations
- JWT auth (register/login), protected routes
- Super-admin-only admin creation endpoint
- Admin dashboard:
  - Metrics (orders, revenue, customers, low stock)
  - Product CRUD + image upload
  - Order monitoring + status updates
  - Inventory tracking with low-stock alerts
- Toast notifications, loading states, search/filter
