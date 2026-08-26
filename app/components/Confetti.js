"use client";

// A brief, muted celebration for the queue confirmation moment — a few
// gold/cream petals, not a rainbow confetti burst.
const COLORS = ["#C8963E", "#E9C983", "#6E7A4E"];
const PIECES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: 8 + ((i * 97) % 84),
  delay: (i % 5) * 110,
  duration: 1100 + (i % 4) * 180,
  color: COLORS[i % COLORS.length],
  size: 5 + (i % 3) * 2,
  rotate: (i * 53) % 360,
}));

export default function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-3 h-0 overflow-visible z-20" aria-hidden="true">
      {PIECES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-petal-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
