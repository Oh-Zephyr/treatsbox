"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// The Treatsbox mark: a ribbon-wrapped gift box with a bow — ties the name
// (a "box" of treats) to the feeling of receiving something sweet, without
// needing a literal food illustration that stops reading at small sizes.
// Pure vector shapes — crisp at any size, works as a favicon.
export function LogoMark({ className = "w-9 h-9" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="7" y="20" width="50" height="9" rx="3" fill="#2B1B12" />
      <rect x="10" y="26" width="44" height="30" rx="3" fill="#2B1B12" />
      <rect x="27" y="20" width="10" height="36" fill="#D8A84E" />
      <rect x="10" y="38" width="44" height="6" fill="#D8A84E" />
      <path
        d="M32 20 C32 20 22 10 15 13 C10 15 13 21 20 20.5 C25 20 32 20 32 20 Z"
        fill="#D8A84E"
      />
      <path
        d="M32 20 C32 20 42 10 49 13 C54 15 51 21 44 20.5 C39 20 32 20 32 20 Z"
        fill="#D8A84E"
      />
      <circle cx="32" cy="20" r="4.5" fill="#C13868" />
    </svg>
  );
}

export default function Logo({ href = "/", size = "md", className = "" }) {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setLogoUrl(d.logoUrl || null))
      .catch(() => {});
  }, []);

  const textSize = size === "sm" ? "text-lg" : "text-xl";
  const markSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const imgHeight = size === "sm" ? "h-7" : "h-9";

  if (logoUrl) {
    return (
      <Link href={href} className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="Treatsbox" className={`${imgHeight} w-auto`} />
      </Link>
    );
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markSize} />
      <span className={`font-display ${textSize} font-semibold text-ink tracking-tight`}>Treatsbox</span>
    </Link>
  );
}
