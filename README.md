# 🕯️ Candle by Kinzee

> A production-ready, full-stack e-commerce platform for a solo made-to-order candle business in India.

Built as a MERN-stack monorepo with a React + Vite storefront and a Node.js + Express REST API, designed for real-world use with Razorpay payments, Brevo transactional emails, Cloudinary image hosting, and MongoDB Atlas.

---

## 📁 Project Structure

```
candlewithkinzee/
├── backend/                  # Node.js + Express REST API
│   ├── scripts/
│   │   ├── createAdmin.js    # One-time admin account creation
│   │   └── seedProducts.js   # Seed placeholder catalog data
│   └── src/
│       ├── config/           # DB connection, Cloudinary, etc.
│       ├── middleware/        # Auth guards, error handlers, rate limiters
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express route handlers
│       ├── services/         # Business logic (orders, pricing, payments, notifications)
│       ├── utils/            # Shared helpers
│       ├── constants.js      # App-wide constants
│       └── app.js / server.js
│
├── frontend/                 # React + Vite customer storefront & admin UI
│   └── src/
│       ├── api/              # Axios API client modules
│       ├── components/       # Shared UI components
│       ├── pages/            # Route-level page components
│       ├── styles/           # CSS stylesheets
│       ├── hooks.js          # Custom React hooks
│       └── App.jsx / main.jsx
│
├── package.json              # Root npm workspaces config
└── README.md
```

---

## ✨ Features

### Customer-Facing Storefront
- **Shop** — Browse the fixed candle catalog with product variants and option surcharges
- **Product Detail** — Select size, scent, and add-ons; price computed server-side
- **Shopping Bag** — Cart managed in local state; no account required
- **Checkout** — Guest-first checkout with Razorpay advance payment integration
- **Order Tracking** — Look up any order by order number + customer phone
- **Quote Requests** — Submit custom candle requests with reference image uploads
- **Our Story** — Brand page
- **Socials** — Social media links

### Admin Panel
- Secure login with bcrypt-hashed passwords and httpOnly JWT cookies
- Login lockout after 5 failed attempts (15-minute cooldown)
- Manage products, orders, quotes, banners, and promo codes

### Business Logic
| Rule | Detail |
|---|---|
| Guest-first checkout | No required customer account flow |
| No inventory tracking | Catalog is fixed; no stock counts |
| Server-side pricing | Order totals computed from active products + surcharges |
| Price capture at order | `priceAtOrder` frozen per line item; history never changes |
| Quote-to-order flow | Admin sets `quotedPrice`; customer accepts → real order created |
| Order tracking auth | Requires both `orderNumber` AND customer phone |
| Cancellation gate | Server rejects cancellation once order reaches `in_progress` |
| Balance payment | Controlled by delivery method and `POST_SUPPORTS_COD` flag |

### Security & Reliability
- Helmet security headers
- `express-mongo-sanitize` for NoSQL injection protection
- XSS sanitization on public banner content
- Rate limiting on promo validation and anonymous order/quote endpoints
- Razorpay webhook signature verification (server-side)
- Zod schema validation on all inputs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v7, Framer Motion, Lucide React, Axios |
| Build Tool | Vite 6 |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas via Mongoose 8 |
| Auth | JWT + bcryptjs + httpOnly cookies |
| Payments | Razorpay (Orders API + Payment Links API) |
| Email | Brevo (transactional) |
| Images | Cloudinary |
| Validation | Zod |
| Testing | Vitest |
| Logging | Morgan |

---

## ⚡ Local Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9 (for workspaces support)
- A running MongoDB instance (local or Atlas)

### 1. Install all dependencies

```bash
npm install
```

This installs dependencies for both `backend` and `frontend` workspaces from the root.

### 2. Configure environment variables

```bash
# Windows (PowerShell)
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

# macOS / Linux
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then edit each `.env` file with your local or test credentials (see [Environment Variables](#-environment-variables) below).

### 3. Create the admin account

```bash
npm run create-admin --workspace backend
```

### 4. Seed placeholder catalog data

```bash
npm run seed --workspace backend
```

### 5. Start the API server

```bash
npm run dev:backend
```

API will be available at `http://localhost:4000`.

### 6. Start the frontend dev server

```bash
npm run dev
```

Storefront will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port for the API server (default: `4000`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `ADMIN_COOKIE_NAME` | Name of the admin session cookie |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret |
| `POST_SUPPORTS_COD` | `true` / `false` — enables COD for India Post delivery |
| `BREVO_API_KEY` | Brevo (formerly Sendinblue) API key |
| `BREVO_SENDER_EMAIL` | Transactional sender email address |
| `BREVO_SENDER_NAME` | Transactional sender display name |
| `WHATSAPP_NUMBER` | WhatsApp number for deep links (e.g. `919999999999`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:4000/api`) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key ID for the checkout SDK |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for customer support deep links |

> ⚠️ **Never commit real secrets.** All `.env` files are gitignored by default.

---

## 🗄️ Data Models

| Model | Description |
|---|---|
| `Admin` | Admin account with bcrypt-hashed password and login attempt tracking |
| `Product` | Candle catalog item with variants, options, and pricing |
| `Order` | Customer order with line items, `priceAtOrder` capture, and status lifecycle |
| `QuoteRequest` | Custom candle request with reference images and quoted price flow |
| `Customer` | Optional guest identity stored for repeat order lookup |
| `Discount` | Promo codes with usage limits and expiry |
| `Banner` | Storefront announcement banners with XSS-sanitized content |

---

## 🚀 Deployment

### Backend → Render

1. Create a **Render Web Service** from this repository.
2. Set **Root Directory** to `backend`.
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add all variables from `backend/.env.example` in Render's environment settings.
6. Set `CLIENT_ORIGIN` to your Vercel production URL.
7. Set `NODE_ENV=production`.

### Frontend → Vercel

1. Create a **Vercel project** from this repository.
2. Set **Root Directory** to `frontend`.
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. Set `VITE_API_BASE_URL` to your Render API URL ending in `/api`.
6. Set `VITE_RAZORPAY_KEY_ID` to your Razorpay live key.

### MongoDB Atlas

- Use an **M0 (free)** cluster for low-traffic production.
- Store the Atlas connection string in `MONGODB_URI`.
- Enable **IP allowlisting** for your Render service outbound IPs.
- The free tier does not include automated backups — export data periodically or upgrade to enable Atlas backups.

### Cloudinary

- Upload product images and quote reference photos to Cloudinary.
- Store only Cloudinary delivery URLs in MongoDB (never raw binaries).

### Razorpay

- Use **Orders API** for advance payments at checkout.
- Use **Payment Links API** for balance collection on delivery.
- Test with `rzp_test_*` credentials first; switch to live keys only after webhook and signature verification passes end-to-end.

### Brevo

- Used for transactional emails: order confirmations, quote status updates.
- WhatsApp customer support uses a `wa.me` deep link — no custom chat server is needed.

---

## 🧪 Testing & Verification

### Run automated tests

```bash
npm test
```

Runs the Vitest suite in `backend/src/tests/`.

### Build the frontend

```bash
npm run build
```

### Pre-production checklist

- [ ] Full order placement on a real mobile device on a slow connection
- [ ] Razorpay test payment with signature and webhook verification
- [ ] India Post vs. personal delivery — verify balance-payment behaviour
- [ ] Admin login lockout triggers after 5 failed attempts
- [ ] Order tracking fails with correct order number but wrong phone number

---

## 📜 Available Scripts

Run all scripts from the **project root** unless noted.

| Command | Description |
|---|---|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start the frontend dev server |
| `npm run dev:backend` | Start the backend dev server (with nodemon) |
| `npm run build` | Build the frontend for production |
| `npm test` | Run backend Vitest test suite |
| `npm run seed --workspace backend` | Seed placeholder product catalog |
| `npm run create-admin --workspace backend` | Create the admin account |

---

## 📄 License

This project is private and proprietary. All rights reserved.
