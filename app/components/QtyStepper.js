"use client";

export default function QtyStepper({ value, onIncrement, onDecrement, min = 0, size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-paper2 p-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDecrement}
        disabled={value <= min}
        className={`${dim} flex items-center justify-center rounded-full bg-white text-ink shadow-sm disabled:opacity-30 active:scale-90 transition-transform`}
      >
        −
      </button>
      <span className="w-7 text-center font-semibold tabular-nums text-ink">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onIncrement}
        className={`${dim} flex items-center justify-center rounded-full bg-oxblood text-white shadow-sm active:scale-90 transition-transform`}
      >
        +
      </button>
    </div>
  );
}
