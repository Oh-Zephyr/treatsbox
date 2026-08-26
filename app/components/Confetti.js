"use client";

// A brief celebratory confetti burst for big moments (landing in the queue).
const COLORS = ["#C13868", "#D8A84E", "#9A2650", "#F0CE8E", "#5C7C63"];
const PIECES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: 4 + ((i * 97) % 92),
  delay: (i % 6) * 90,
  duration: 1400 + (i % 5) * 220,
  color: COLORS[i % COLORS.length],
  size: 6 + (i % 3) * 3,
  rotate: (i * 47) % 360,
}));

export default function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-4 h-0 overflow-visible z-20" aria-hidden="true">
      {PIECES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-sm animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
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
