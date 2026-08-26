import { getDb } from "./db";
import { nanoid } from "nanoid";

export { computeOrderTotals } from "./pricing";

export async function nextOrderNumber() {
  const db = await getDb();
  db.data.settings.orderCounter = (db.data.settings.orderCounter || 0) + 1;
  const num = db.data.settings.orderCounter;
  await db.write();
  return `TB-${String(num).padStart(4, "0")}`;
}

export async function nextQueuePosition() {
  const db = await getDb();
  const activeQueued = db.data.orders.filter(
    (o) => o.orderStatus === "Queued" || o.orderStatus === "Ready for Collection"
  );
  return activeQueued.length + 1;
}

export function newOrderId() {
  return "ord_" + nanoid(10);
}
