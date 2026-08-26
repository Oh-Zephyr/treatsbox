import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dataDir = path.join(process.cwd(), "data");
const file = path.join(dataDir, "db.json");

// The data/ directory itself isn't guaranteed to exist on a fresh clone or
// deploy (git doesn't track empty folders, and data/db.json is gitignored
// on purpose since it's runtime data, not source). Without this, the first
// write — e.g. a customer clicking "I Have Paid" — fails because there's
// nowhere on disk to write to, even though reads succeed via in-memory
// defaults. Create it defensively before the adapter ever touches the file.
try {
  fs.mkdirSync(dataDir, { recursive: true });
} catch (err) {
  console.error("Could not create data directory:", err);
}

const adapter = new JSONFile(file);

const defaultData = {
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
    fulfillmentMessage: "Your Treatsbox order will be ready for collection this Sunday after Church service.",
    acceptingOrders: true,
    maximumOrders: null,
    cutoffAt: null,
    orderCounter: 0
  },
  admins: [
    { id: "admin1", username: "admin", passwordHash: bcrypt.hashSync("treatsbox2026", 10) }
  ]
};

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  const db = new Low(adapter, defaultData);
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
  // backfill any newly-added default keys on old data files
  let touched = false;
  for (const key of Object.keys(defaultData)) {
    if (db.data[key] === undefined) {
      db.data[key] = defaultData[key];
      touched = true;
    }
  }
  if (touched) await db.write();
  dbInstance = db;
  return db;
}
