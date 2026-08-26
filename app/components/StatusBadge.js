const ORDER_STYLES = {
  Queued: "bg-forest/10 text-forest",
  "Ready for Collection": "bg-forest/10 text-forest",
  Completed: "bg-ink/10 text-ink2",
  Cancelled: "bg-alert/10 text-alert",
};

const PAYMENT_STYLES = {
  "Not Verified": "bg-alert/10 text-alert",
  "Awaiting Confirmation": "bg-forest/10 text-forest",
  Confirmed: "bg-forest/10 text-forest",
  Rejected: "bg-alert/10 text-alert",
};

const DOT = {
  green: "bg-forest",
  red: "bg-alert",
};

function dotFor(kind, label) {
  if (kind === "order") return label === "Cancelled" ? "red" : "green";
  return label === "Not Verified" || label === "Rejected" ? "red" : "green";
}

export default function StatusBadge({ kind, label, size = "md" }) {
  const styles = kind === "order" ? ORDER_STYLES : PAYMENT_STYLES;
  const cls = styles[label] || "bg-ink/10 text-ink2";
  const dot = DOT[dotFor(kind, label)];
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad} ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
