"use client";

const ICONS = {
  samosa: (
    <path d="M32 20 L48 46 L16 46 Z" strokeLinejoin="round" />
  ),
  springroll: (
    <>
      <rect x="16" y="26" width="32" height="12" rx="6" />
      <line x1="22" y1="26" x2="22" y2="38" />
      <line x1="42" y1="26" x2="42" y2="38" />
    </>
  ),
  puffpuff: (
    <>
      <circle cx="24" cy="32" r="9" />
      <circle cx="40" cy="28" r="7" />
      <circle cx="38" cy="42" r="6" />
    </>
  ),
  beef: (
    <path d="M18 40 C16 30 24 20 34 22 C44 24 48 34 42 40 C36 46 20 48 18 40 Z" />
  ),
  chicken: (
    <path d="M30 18 C22 18 18 26 22 34 L18 46 L26 42 C28 44 34 44 37 41 C46 38 46 24 36 20 C34 19 32 18 30 18 Z" />
  ),
  pouch: (
    <path d="M22 22 H42 L44 46 C44 47 43 48 42 48 H22 C21 48 20 47 20 46 Z M26 22 C26 16 38 16 38 22" />
  ),
  box: (
    <>
      <rect x="16" y="24" width="32" height="22" rx="2" />
      <line x1="16" y1="32" x2="48" y2="32" />
      <path d="M24 24 L32 32 L40 24" />
    </>
  ),
  beefpack: (
    <>
      <circle cx="32" cy="34" r="16" fill="none" />
      <path d="M24 38 C23 32 28 27 34 29 C40 31 42 37 38 41 C34 45 25 45 24 38 Z" />
    </>
  ),
  chickenpack: (
    <>
      <circle cx="32" cy="34" r="16" fill="none" />
      <path d="M31 21 C25 21 22 27 25 33 L22 43 L29 40 C31 42 36 42 38 40 C45 38 45 26 37 23 C35 22 33 21 31 21 Z" />
    </>
  ),
  pack: (
    <>
      <circle cx="32" cy="34" r="16" fill="none" />
      <circle cx="26" cy="30" r="4" />
      <circle cx="38" cy="30" r="4" />
      <circle cx="32" cy="40" r="4" />
    </>
  ),
  food: (
    <circle cx="32" cy="32" r="10" />
  ),
};

export default function FoodIcon({ name = "food", className = "", tone = "marigold" }) {
  const path = ICONS[name] || ICONS.food;
  const bg = tone === "paper2" ? "bg-paper2" : "bg-marigold/20";
  return (
    <div className={`flex items-center justify-center rounded-full ${bg} ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="w-1/2 h-1/2 text-oxblood"
      >
        {path}
      </svg>
    </div>
  );
}
