# Treatsbox — Preorder Web App

A production-structured, mobile-first preorder platform for Treatsbox. Built with
Next.js 14 (App Router), Tailwind CSS, and a lightweight JSON file database.

## Quick start

```bash
npm install
npm run dev
```

Visit:
- **Storefront:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login
  - Username: `admin`
  - Password: `treatsbox2026`
  - **Change this before going live** — see "Changing the admin password" below.

The first time the app runs it seeds itself with the packages, products, and
settings from the brief (Regular Beef Pack, Regular Chicken Pack, individual
items, bank placeholder details, etc.) into `data/db.json`.

## What's implemented

**Customer flow:** browse packages / build-your-own -> live sticky cart (desktop
sidebar, mobile bottom sheet) -> checkout details -> review -> payment instructions
-> **"I Have Paid" immediately queues the order** (order number, Queued status,
"Not Verified" payment status) -> WhatsApp receipt hand-off -> "I've Sent My
Receipt" flips payment to "Awaiting Confirmation" without ever leaving the queue.
Orders are looked up again any time at `/order/[orderNumber]`.

**Admin:** JWT-cookie authenticated dashboard at `/admin` with stats, a
searchable/filterable orders table (+ mobile card view), a dedicated Sunday
Queue view, order detail with Confirm/Reject Payment, Mark Ready/Completed,
Cancel actions, full product & package management (including package contents
and icon selection), and a Settings page for bank details, WhatsApp number,
fulfillment message, accept-orders toggle, and capacity limits.

**Business rules honored:**
- Order + payment status are tracked independently (never combined).
- Clicking "I Have Paid" creates the order and queues it immediately — payment
  verification is a separate, later step.
- Duplicate "I Have Paid" clicks are protected against (idempotency key).
- Turning off "Accept New Orders" (or hitting the optional maximum-orders cap)
  blocks new checkouts and shows the closed-orders screen automatically.
- Packaging line items (Packaging Pouch / Packaging Box) are broken out from
  the food subtotal in every total shown to customer and admin.

## Data & architecture notes

- **Database:** `lib/db.js` supports two backends automatically, based on
  whether a Postgres connection string is present in the environment:
  - **Postgres** (used when `POSTGRES_URL` / `POSTGRES_PRISMA_URL` /
    `POSTGRES_URL_NON_POOLING` is set — e.g. automatically on Vercel once you
    connect a Supabase/Postgres database from the Storage tab). The whole app
    state is stored as a single JSONB blob in one `app_state` table/row. This
    is a deliberately simple schema rather than a fully normalized one — for
    an app this size it's the right tradeoff, and it means every API route
    works unchanged regardless of which backend is active. If the business
    grows enough that this becomes a bottleneck, splitting into real
    tables (products/orders/etc.) is the natural next step, and is isolated
    entirely to this one file.
  - **Local JSON file** (`data/db.json`), used automatically when no Postgres
    connection string is present — e.g. plain local development without a
    database hooked up. Nothing to configure; it just works out of the box.

  **Why this matters on Vercel specifically:** Vercel runs the app as
  serverless functions with no shared, persistent disk between requests —
  writing to a local file there looks like it works but the data doesn't
  reliably survive to the next request. Postgres is what makes orders/admin
  changes actually persist once deployed there. Local dev without Postgres
  configured is unaffected — the file-based fallback works exactly as before.
- **Pricing logic** lives in `lib/pricing.js` (pure function, shared by the
  client-side cart and the server-side order API) so totals can never drift
  between what the customer sees and what gets saved.
- **Auth:** `lib/auth.js` signs a short-lived JWT into an httpOnly cookie on
  login; `middleware.js` protects every `/admin/*` page and `/api/admin/*`
  route.
- **Images:** no stock photography is bundled (none was supplied, and none
  could be safely sourced automatically for a real commercial product). Each
  product/package uses a small custom line-icon (`app/components/FoodIcon.js`)
  in the Treatsbox color palette instead. Swap in real food photography by
  replacing the `<FoodIcon>` usage in `PackageCard.js` / `ProductCard.js` with
  a `next/image` pointed at your own hosted photos.

## Changing the admin password

Passwords are bcrypt-hashed in `lib/db.js` (`defaultData.admins`). To set a
real password before launch, generate a new hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR-NEW-PASSWORD', 10))"
```

Paste the result into `passwordHash` in `lib/db.js`, then delete
`data/db.json` so it reseeds (or edit the admin entry directly in
`data/db.json` if you already have live orders you don't want to lose).

## Deploying

This runs anywhere Node.js runs (Vercel, Render, a VPS, etc.). Two things
worth setting for production:

- `ADMIN_JWT_SECRET` environment variable — a long random string used to sign
  admin session cookies. If not set, a development fallback is used, which is
  fine locally but should never be used in production.
- A Postgres connection (`POSTGRES_URL`) — required on Vercel or any other
  platform without persistent disk (see "Database" above for why). On
  Render/Railway with a real persistent disk attached, the local-file backend
  works fine without this.
