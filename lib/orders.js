import { nanoid } from "nanoid";

export { computeOrderTotals } from "./pricing";

// IMPORTANT: these take the caller's already-loaded `db` object and mutate
// it in place -- they do NOT call getDb() or db.write() themselves. Every
// getDb() call (Postgres backend) does a fresh read, returning an
// independent snapshot; if this function read its own separate snapshot,
// incremented the counter, and wrote it back, that write would then get
// silently clobbered the moment the caller's own (older) snapshot got
// written afterwards -- which is exactly what was happening: the counter
// increment never stuck, so every single order was assigned "TB-0001".
export function nextOrderNumber(db) {
  db.data.settings.orderCounter = (db.data.settings.orderCounter || 0) + 1;
  return `TB-${String(db.data.settings.orderCounter).padStart(4, "0")}`;
}

export function nextQueuePosition(db) {
  const activeQueued = db.data.orders.filter(
    (o) => o.orderStatus === "Queued" || o.orderStatus === "Ready for Collection"
  );
  return activeQueued.length + 1;
}

export function newOrderId() {
  return "ord_" + nanoid(10);
}
