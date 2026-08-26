"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { formatNaira } from "@/lib/format";
import Logo from "./Logo";

export default function SiteNav() {
  const { totals, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink2">
          <Link href="/order" className="hover:text-ink transition-colors">Order</Link>
          <Link href="/track" className="hover:text-ink transition-colors">Track Order</Link>
          <a href="/#how-it-works" className="hover:text-ink transition-colors">How It Works</a>
          <a href="/#contact" className="hover:text-ink transition-colors">Contact</a>
        </nav>
        <Link
          href="/order"
          className="relative inline-flex items-center gap-2 rounded-full bg-oxblood text-white text-sm font-semibold px-4 py-2.5 shadow-pop hover:bg-oxblood/90 transition-colors"
        >
          {itemCount > 0 ? `Order · ${formatNaira(totals.grandTotal)}` : "Start Order"}
        </Link>
      </div>
    </header>
  );
}
