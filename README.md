# 🕯️ Atelier Candle by Kinzee

> A luxury, enterprise-grade Next.js App Router e-commerce platform for a bespoke made-to-order candle business in India.

This project has been upgraded from a legacy decoupled MERN monorepo into a unified, highly optimized **Next.js App Router** application located in the `main/` directory. It features a stunning glassmorphic UI, Google Fonts typography (Cinzel & Plus Jakarta Sans), TailAdmin admin workspace, and Redis-backed cancellation request queueing.

---

## 📁 Project Structure

```
CandleByKinzee/
├── main/                       # Unified Next.js App Router Project
│   ├── app/                    # Next.js pages, api routes, and layouts
│   │   ├── api/                # Unified backend endpoints (auth, products, orders, discounts, etc.)
│   │   ├── admin/              # TailAdmin Admin Workspace (orders, quotes, catalog, coupons, cancellations)
│   │   ├── checkout/           # Multi-step checkout with live promo codes & address selection
│   │   ├── track/              # Interactive customer order tracker and quote negotiation board
│   │   └── globals.css         # Global design tokens, animations, and typography
│   ├── components/             # Reusable Client & Server components (FlameButton, CartContext, etc.)
│   ├── lib/                    # Shared business logic, mongoose models, and services
│   │   ├── models/             # Mongoose schemas (Order, Product, Customer, Discount, CancellationTicket)
│   │   ├── services/           # Payment, pricing, and notification logic
│   │   └── mailQueue.js        # Redis-backed job list queue for cancellation notifications
│   ├── public/                 # Static assets (images, banners)
│   ├── next.config.mjs         # Next.js configurations
│   └── package.json            # Next.js dependencies and scripts
└── Legacy/                     # Kept for historical reference (decoupled backend & frontend)
```

---

## ✨ Features & Business Workflows

### 1. Customer-Facing Storefront
- **Shop & Customization** — Explore active candle categories (Signature, Luxury, Gift Boxes, Decor). Select custom colors/scents with automatic price calculations.
- **Smart Checkout** — Dual-mode shipping address selection:
  - **Choose from Saved Address**: Shows clickable saved address cards from the customer profile. Automatically pre-fills details and hides manual input fields.
  - **Enter Manually**: Displays text inputs for new addresses.
- **Live Promo Codes** — Form fields on Steps 2 & 3 and sidebar validating codes live against `/api/promo/validate`.
- **Bespoke Quote Request** — Customers upload design briefs and images. Discuss terms, materials, and pricing via a real-time negotiation board.
- **Interactive Timed Timelines** — Orders are tracked via unique IDs with step-by-step progress tracking (Curing, Handcrafting, Packaging, Dispatch).

### 2. TailAdmin Admin Dashboard (`/admin`)
- **Left Fixed Sidebar**: Section navigation (Overview, Shop Orders, Custom Quotes, Cancel Requests, Catalog, Coupons) with pending counters.
- **Top Header Bar**: Real-time customer search, database connectivity indicators, and active ticket alerts.
- **Metric Analytics**: Summary cards for gross revenue, active dispatches, pending quotes, and cancellation tickets.
- **Product SKUs & Offers**: Drawer widgets to add/edit products, activate/deactivate listings, register coupon codes, and delete discounts.

### 3. Redis-Backed Cancellation Ticket System
- **Safety Gate**: Customers request cancellations from their order tracker.
- **cancellation Model**: Creates a `CancellationTicket` in MongoDB and pushes email dispatch jobs into a **Redis Queue** (`lib/mailQueue.js`) alerting `yashpouranik124@gmail.com`.
- **Review Tab**: Admin approves (cancels order and initiates refunds) or declines tickets directly from the dashboard.

---

## ⚡ Local Setup

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB (Running locally or MongoDB Atlas)
- Redis Server (Optional; falls back to an in-memory mock if `REDIS_URL` is omitted)

### 2. Install Dependencies
Navigate to the `main` directory:
```bash
cd main
npm install
```

### 3. Setup Environment Variables
Create a `main/.env.local` file:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/candlewithkinzee
JWT_SECRET=your_super_secret_jwt_passcode
ADMIN_COOKIE_NAME=atelier_admin_token
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=yourkeysecret
POST_SUPPORTS_COD=true
REDIS_URL=redis://127.0.0.1:6379
```

### 4. Seed Admin & Catalog Data
Run the seeding scripts from inside the `main` directory:
```bash
# Seed owner credentials (admin@kinzee.com / kinzeeadmin123)
node ../C:/Users/DELL/.gemini/antigravity/brain/608696b7-9462-4ba7-a1cb-afc2f4ac848e/scratch/seed_admin.js
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to manage the Atelier.

---

## 🧪 Production Compilation
Verify there are no syntax or type compilation errors before deploying:
```bash
npm run build
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with Hot Module Replacement |
| `npm run build` | Compiles Next.js production build |
| `npm run start` | Serves compiled production build |
| `npm run lint` | Runs ESLint rules check |
