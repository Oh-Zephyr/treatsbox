export function formatNaira(amount) {
  const n = Math.round(Number(amount) || 0);
  return "₦" + n.toLocaleString("en-NG");
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Formats a plain date (e.g. "2026-08-31", the admin-configured next
// preorder collection date) as a weekday + date, e.g. "Sunday, 31 Aug".
// Used throughout the site instead of a hardcoded day name, so the
// business can run its preorder cycle on any day.
export function formatWeekdayDate(dateStr) {
  if (!dateStr) return "";
  // Parse as a plain date (no time/timezone shift) so "2026-08-31" always
  // reads as that calendar date regardless of the visitor's timezone.
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "";
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" });
}

// Just the weekday name, e.g. "Sunday" — for short copy like an eyebrow
// label ("Sunday Preorders").
export function formatWeekdayName(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "";
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-NG", { weekday: "long" });
}
