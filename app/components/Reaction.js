"use client";

// A single restrained sparkle — acknowledges "added to order" without
// turning into a burst of emoji. Premium, not playful.
export default function Reaction({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <span className="reaction-pop" style={{ right: "8%", top: "6%" }}>
        ✦
      </span>
    </div>
  );
}
