"use client";

// A small floating "reaction" burst (heart + sparkles) used to celebrate
// moments like adding an item to the order. Purely decorative and brief.
const GLYPHS = ["♥", "✦", "♥", "✧"];

export default function Reaction({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {GLYPHS.map((g, i) => (
        <span
          key={i}
          className="reaction-pop text-oxblood"
          style={{
            left: `${20 + i * 18}%`,
            top: "10%",
            animationDelay: `${i * 60}ms`,
          }}
        >
          {g}
        </span>
      ))}
    </div>
  );
}
