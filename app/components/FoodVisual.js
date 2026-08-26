"use client";

import Image from "next/image";

// The app's primary visual unit for food. Renders a real photo when the
// admin has set one (Products/Packages > Photo URL), and otherwise falls
// back to a large, intentionally-composed editorial placeholder rather than
// a small icon badge — so the image area is never an afterthought.

const ICONS = {
  samosa: <path d="M32 16 L52 50 L12 50 Z" strokeLinejoin="round" />,
  springroll: (
    <>
      <rect x="12" y="24" width="40" height="16" rx="8" />
      <line x1="20" y1="24" x2="20" y2="40" />
      <line x1="44" y1="24" x2="44" y2="40" />
    </>
  ),
  puffpuff: (
    <>
      <circle cx="22" cy="30" r="11" />
      <circle cx="42" cy="26" r="8" />
      <circle cx="40" cy="44" r="7" />
    </>
  ),
  beef: <path d="M14 42 C11 28 22 16 36 19 C50 22 55 36 46 44 C38 51 17 53 14 42 Z" />,
  chicken: (
    <path d="M31 14 C21 14 16 24 21 34 L16 50 L26 45 C29 48 36 48 40 44 C51 40 51 22 38 17 C35 15 33 14 31 14 Z" />
  ),
  pouch: <path d="M18 20 H46 L49 50 C49 51.5 47.5 53 46 53 H18 C16.5 53 15 51.5 15 50 Z M23 20 C23 12 41 12 41 20" />,
  box: (
    <>
      <rect x="12" y="26" width="40" height="26" rx="2" />
      <line x1="12" y1="36" x2="52" y2="36" />
      <path d="M22 26 L32 36 L42 26" />
    </>
  ),
  beefpack: (
    <>
      <circle cx="32" cy="34" r="20" fill="none" />
      <path d="M22 39 C20 31 27 25 35 28 C43 31 46 39 40 44 C34 49 23 49 22 39 Z" />
    </>
  ),
  chickenpack: (
    <>
      <circle cx="32" cy="34" r="20" fill="none" />
      <path d="M31 19 C23 19 19 27 23 35 L19 47 L28 43 C31 46 37 46 40 43 C49 40 49 25 39 21 C36 20 33 19 31 19 Z" />
    </>
  ),
  pack: (
    <>
      <circle cx="32" cy="34" r="20" fill="none" />
      <circle cx="25" cy="29" r="5" />
      <circle cx="40" cy="29" r="5" />
      <circle cx="32" cy="42" r="5" />
    </>
  ),
  food: <circle cx="32" cy="32" r="13" />,
};

const SHAPES = ["rounded-blob", "rounded-blob2", "rounded-[2.25rem]"];

export default function FoodVisual({
  imageUrl,
  iconName = "food",
  alt = "",
  className = "",
  variant = "card", // "card" | "hero" | "row"
  shapeIndex = 0,
}) {
  const path = ICONS[iconName] || ICONS.food;
  const shapeClass = variant === "row" ? "rounded-2xl" : SHAPES[shapeIndex % SHAPES.length];

  if (imageUrl) {
    // next/image gives real photography automatic WebP/AVIF conversion,
    // responsive sizing, and lazy loading (skipped only for the hero, which
    // is above the fold) — the performance groundwork for when actual
    // Treatsbox photos are added, without needing them yet to build this.
    return (
      <div className={`relative overflow-hidden ${shapeClass} shadow-card ${className}`}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={variant === "hero" ? "(min-width: 768px) 480px, 90vw" : variant === "row" ? "80px" : "(min-width: 768px) 360px, 90vw"}
          className="object-cover"
          loading={variant === "hero" ? "eager" : "lazy"}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${shapeClass} bg-gradient-to-br from-paper2 via-marigold/15 to-oxblood/10 shadow-card ${className}`}
    >
      {/* faint diagonal texture so the placeholder reads as intentional, not empty */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #2B1B12 0 1px, transparent 1px 14px)",
        }}
      />
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="relative w-[42%] h-[42%] text-oxblood/70"
      >
        {path}
      </svg>
    </div>
  );
}
