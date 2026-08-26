// Remembers which orders were placed from this browser, with no account or
// login required. Stored in localStorage on the customer's own device --
// this is genuinely private to them, survives closing the tab/browser, but
// won't follow them to a different device or browser. The manual "look up
// by order number" option (see app/track/page.js) is the fallback for that.
const STORAGE_KEY = "treatsbox_my_orders";
const MAX_ENTRIES = 25;

export function getOrderHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addOrderToHistory(order) {
  if (typeof window === "undefined") return;
  try {
    const existing = getOrderHistory().filter((o) => o.orderNumber !== order.orderNumber);
    const next = [
      { orderNumber: order.orderNumber, createdAt: order.createdAt, grandTotal: order.grandTotal },
      ...existing,
    ].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage can fail (private browsing, storage full, etc.) --
    // the order itself is already safely saved server-side either way,
    // this is purely a convenience index, so fail silently.
  }
}
