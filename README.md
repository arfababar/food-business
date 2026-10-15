# Baba Hafeez - Fast Food & Grill (Gujranwala)

Production-ready e-commerce food ordering platform built for **Baba Hafeez** in Gujranwala, Pakistan.

## Tech Stack
* **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide React, React Router v7
* **State & SEO:** React Context API, React Helmet Async (JSON-LD Schema)
* **Validation:** Zod Schema (Pakistani phone & address formatting)
* **Backend:** Supabase (PostgreSQL, Row Level Security, Secure RPC Functions, Supabase Auth)
* **Testing:** Vitest, React Testing Library, Playwright (E2E browser testing on Desktop and 375px Mobile)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Note: If environment variables are omitted, the application runs in secure offline fallback mode with local storage persistence and mock admin credentials.)*

### 3. Run Database Migrations
1. Open your Supabase project SQL Editor at [app.supabase.com](https://app.supabase.com).
2. Paste and run the contents of [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).
3. This creates:
   - `products` table with Row Level Security (RLS)
   - `orders` table with Row Level Security
   - `promo_codes` table with server-side validation
   - `order_number_seq` sequential generator
   - `place_order` stored procedure (recalculates line item prices server-side)
   - `get_order_by_number` secure public lookup RPC

### 4. Create Admin User
1. Go to **Authentication > Users** in your Supabase dashboard.
2. Click **Add User** and create an admin email & password (e.g., `admin@babahafeez.com`).
3. You can now log into `/admin` with this account to view incoming orders, update dispatch status, toggle sold-out products, and manage promo codes.
*(In offline fallback mode, use `admin@babahafeez.com` and password `admin123`)*

---

## Development & Testing Commands

### Start Local Dev Server
```bash
npm run dev
```

### Run ESLint Verification
```bash
npm run lint
```

### Run Unit Tests (Vitest)
```bash
npm run test
```

### Run Playwright Browser Tests (Desktop & 375px Mobile Viewport)
```bash
node tests/test-phase1.js
node tests/e2e/order-flow.spec.js
```

### Production Build
```bash
npm run build
```

---

## Deployment Instructions

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. In Project Settings > Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. The included `vercel.json` automatically handles SPA route rewrites for `/menu`, `/checkout`, `/admin`, etc.

### Deploy to Netlify
1. Connect repository on [Netlify](https://netlify.com).
2. Configure build command: `npm run build` and publish directory: `dist`.
3. Set environment variables in Netlify site settings.
4. The included `netlify.toml` automatically handles SPA route rewrites.
