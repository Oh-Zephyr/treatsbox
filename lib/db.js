import { Pool } from "pg";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Data layer. Two backends:
//
//   - Postgres (used automatically when POSTGRES_URL / POSTGRES_PRISMA_URL /
//     POSTGRES_URL_NON_POOLING is set — e.g. on Vercel via the Supabase
//     integration). The whole app state is stored as a single JSONB blob in
//     one table/row. This is a deliberately simple schema, not a fully
//     normalized one: for an app this size it's the right tradeoff, and it
//     means every existing API route — which all just read/mutate
//     `db.data.<collection>` and call `db.write()` — works completely
//     unchanged. Concurrent admin edits last-write-win at the whole-state
//     level, same as the file-based version before it. If this app ever
//     needs to scale past a small preorder operation, splitting this into
//     real tables (products/orders/etc.) is the natural next step.
//
//   - A local JSON file (lib's original behavior), used automatically when
//     no Postgres connection string is present — e.g. plain local dev
//     without a database hooked up.
//
// Both return the same shape: { data, write() }.
// ---------------------------------------------------------------------------

// Prefer POSTGRES_PRISMA_URL first: it's the connection string Vercel/Supabase
// mark specifically for use through the connection pooler with
// `pgbouncer=true` set, which matters for serverless — without that flag,
// the driver may behave in ways the pooler's transaction-pooling mode
// doesn't support. POSTGRES_URL (no pgbouncer flag) and the non-pooled
// POSTGRES_URL_NON_POOLING are kept as fallbacks.
// Prefer POSTGRES_PRISMA_URL first: it's the connection string Vercel/Supabase
// mark specifically for use through the connection pooler with
// `pgbouncer=true` set, which matters for serverless — without that flag,
// the driver may behave in ways the pooler's transaction-pooling mode
// doesn't support. POSTGRES_URL (no pgbouncer flag) and the non-pooled
// POSTGRES_URL_NON_POOLING are kept as fallbacks.
const RAW_CONNECTION_STRING =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  null;

// Recent versions of pg-connection-string treat `sslmode=require` in the URL
// as requiring full certificate-chain verification (previously it didn't),
// which fails against Supabase's pooler chain and overrides an explicit
// `ssl: { rejectUnauthorized: false }` passed alongside it. Since we set SSL
// options explicitly below, strip sslmode from the string entirely so
// there's no conflicting signal.
const CONNECTION_STRING = RAW_CONNECTION_STRING
  ? RAW_CONNECTION_STRING.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/[?&]$/, "")
  : null;

export const defaultData = {
  products: [
    { id: "p1", name: "Samosa", description: "Crisp pastry, spiced filling.", price: 350, image: "samosa", imageUrl: null, active: true, sortOrder: 1, maxQty: null },
    { id: "p2", name: "Spring Roll", description: "Golden and crunchy.", price: 350, image: "springroll", imageUrl: null, active: true, sortOrder: 2, maxQty: null },
    { id: "p3", name: "Puff Puff", description: "Soft, sweet, fried dough.", price: 200, image: "puffpuff", imageUrl: null, active: true, sortOrder: 3, maxQty: null },
    { id: "p4", name: "Beef Cut", description: "Peppered beef, cut small.", price: 250, image: "beef", imageUrl: null, active: true, sortOrder: 4, maxQty: null },
    { id: "p5", name: "Chicken", description: "Seasoned, grilled chicken.", price: 2000, image: "chicken", imageUrl: null, active: true, sortOrder: 5, maxQty: null },
    { id: "p6", name: "Packaging Pouch", description: "Light pouch for small orders.", price: 150, image: "pouch", imageUrl: null, active: true, sortOrder: 6, maxQty: null },
    { id: "p7", name: "Packaging Box", description: "Sturdy box for bigger orders.", price: 600, image: "box", imageUrl: null, active: true, sortOrder: 7, maxQty: null }
  ],
  packages: [
    {
      id: "pkg1", name: "Regular Beef Pack", description: "Our classic beef combo.",
      price: 2400, image: "beefpack", imageUrl: null, active: true,
      contents: [
        { productId: "p1", label: "Samosa", quantity: 1 },
        { productId: "p2", label: "Spring Roll", quantity: 1 },
        { productId: "p3", label: "Puff Puff", quantity: 3 },
        { productId: "p4", label: "Beef Cuts", quantity: 4 }
      ]
    },
    {
      id: "pkg2", name: "Regular Chicken Pack", description: "Our classic chicken combo.",
      price: 3400, image: "chickenpack", imageUrl: null, active: true,
      contents: [
        { productId: "p1", label: "Samosa", quantity: 1 },
        { productId: "p2", label: "Spring Roll", quantity: 1 },
        { productId: "p3", label: "Puff Puff", quantity: 3 },
        { productId: "p5", label: "Chicken", quantity: 1 }
      ]
    }
  ],
  orders: [],
  settings: {
    businessName: "Treatsbox",
    bankName: "Guaranty Trust Bank",
    accountName: "Treatsbox Foods",
    accountNumber: "0123456789",
    whatsappNumber: "2348012345678",
    // The specific date the current preorder batch will be ready for
    // collection (ISO date, e.g. "2026-08-31"). Admin sets this each cycle
    // -- it's not fixed to any particular day of the week. Orders snapshot
    // this value at creation time (see app/api/orders/route.js) so past
    // orders keep showing the date that was actually promised to that
    // customer, even after the admin sets a new date for the next cycle.
    nextPreorderDate: null,
    // Optional custom logo image URL. Falls back to the built-in vector
    // mark (app/components/Logo.js) when unset.
    logoUrl: null,
    fulfillmentMessage: "We'll let you know exactly when your Treatsbox is ready for collection.",
    acceptingOrders: true,
    maximumOrders: null,
    cutoffAt: null,
    orderCounter: 0
  },
  admins: [
    { id: "admin1", username: "admin", passwordHash: bcrypt.hashSync("treatsbox2026", 10) }
  ]
};

function backfillDefaults(data) {
  let touched = false;
  for (const key of Object.keys(defaultData)) {
    if (data[key] === undefined) {
      data[key] = defaultData[key];
      touched = true;
    }
  }
  return touched;
}

// --- Postgres backend --------------------------------------------------

let pgPool = null;

function getPool() {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
      // Serverless: each function invocation is typically one request, so
      // keep the per-instance pool small to avoid exhausting the pooler's
      // connection budget across many concurrent invocations.
      max: 1
    });
  }
  return pgPool;
}

let schemaReadyPromise = null;

async function ensureSchema(pool) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool
      .query(
        `
      CREATE TABLE IF NOT EXISTS app_state (
        id integer PRIMARY KEY DEFAULT 1,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `
      )
      .catch((err) => {
        // CREATE TABLE IF NOT EXISTS isn't fully race-safe under concurrent
        // first-time creation: multiple cold serverless instances can race
        // to create the same table at once, and Postgres can throw a
        // duplicate-key error on its internal pg_type catalog even though
        // the end result (the table now exists) is exactly what we wanted.
        // Treat that specific race as success. Anything else is a real
        // problem — clear the cached promise so the next request gets a
        // clean retry instead of a permanently-rejected cached promise.
        if (err?.code === "23505") {
          return;
        }
        schemaReadyPromise = null;
        throw err;
      });
  }
  await schemaReadyPromise;
}

async function getPostgresDb() {
  const pool = getPool();
  await ensureSchema(pool);

  const { rows } = await pool.query("SELECT data FROM app_state WHERE id = 1");

  let data;
  if (rows.length === 0) {
    data = defaultData;
    await pool.query("INSERT INTO app_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING", [
      JSON.stringify(data)
    ]);
  } else {
    data = rows[0].data;
    if (backfillDefaults(data)) {
      await pool.query("UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1", [JSON.stringify(data)]);
    }
  }

  return {
    data,
    write: async () => {
      await pool.query("UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1", [JSON.stringify(data)]);
    }
  };
}

// --- Local file backend (fallback for plain local dev) -----------------

const dataDir = path.join(process.cwd(), "data");
const file = path.join(dataDir, "db.json");

function getLocalDb() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.error("Could not create data directory:", err);
  }
  const adapter = new JSONFile(file);
  return new Low(adapter, defaultData);
}

async function getFileDb() {
  const db = getLocalDb();
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
  if (backfillDefaults(db.data)) {
    await db.write();
  }
  return db;
}

// --- Public entry point --------------------------------------------------

export async function getDb() {
  if (CONNECTION_STRING) {
    return getPostgresDb();
  }
  return getFileDb();
}
