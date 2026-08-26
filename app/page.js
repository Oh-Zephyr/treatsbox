"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./components/CartContext";
import SiteNav from "./components/SiteNav";
import PackageCard from "./components/PackageCard";
import ProductCard from "./components/ProductCard";
import { DesktopOrderSummary, MobileOrderBar } from "./components/OrderSummary";
import ClosedNotice from "./components/ClosedNotice";
import { formatNaira } from "@/lib/format";

const HOW_IT_WORKS = [
  { title: "Choose Your Treats", body: "Pick a ready-made pack or build your own from individual items." },
  { title: "Make Payment", body: "Transfer the order total to the Treatsbox account." },
  { title: "Send Your Receipt", body: "Send your payment receipt through WhatsApp for verification." },
  { title: "Receive Your Order", body: "Your Treatsbox order will be ready on Sunday after Church service." },
];

export default function HomePage() {
  const { catalog, itemCount, totals } = useCart();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setSettings({ acceptingOrders: true }));
  }, []);

  if (settings && settings.acceptingOrders === false) {
    return (
      <>
        <SiteNav />
        <ClosedNotice settings={settings} />
      </>
    );
  }

  return (
    <>
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="brand-blob blob-rose w-[420px] h-[420px] -top-32 -left-24 animate-blob-drift" />
        <div className="brand-blob blob-gold w-[380px] h-[380px] -top-16 right-[-140px] animate-blob-drift-slow" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
          <p className="inline-flex items-center gap-2 font-display italic text-base text-oxblood mb-5">
            <span className="w-6 h-px bg-marigold2" />
            Sunday preorders, after Church service
            <span className="w-6 h-px bg-marigold2" />
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-ink leading-[1.02] max-w-3xl mx-auto tracking-tight">
            Order Your Treatsbox
          </h1>
          <p className="text-ink2 text-lg mt-5 max-w-md mx-auto">
            Choose a ready-made pack or build your own — beautifully packaged, always fresh.
          </p>
          <Link
            href="#order"
            className="inline-flex mt-8 rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-white font-semibold px-8 py-4 shadow-glow hover:brightness-105 hover:-translate-y-0.5 transition-all"
          >
            Start Your Order
          </Link>
        </div>
      </section>

      {/* ORDER EXPERIENCE */}
      <section id="order" className="max-w-6xl mx-auto px-5 md:px-8 pb-16 grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="min-w-0">
          {/* Choose a pack */}
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-marigold2 uppercase mb-1">Signature Packs</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Choose a Pack</h2>
            <p className="text-ink2 text-sm mt-1 mb-4">Pick one of our ready-made Treatsbox options.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {catalog.packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
              {catalog.packages.length === 0 && (
                <p className="text-sm text-ink2">Loading packs…</p>
              )}
            </div>
          </div>

          {/* Build your own */}
          <div>
            <p className="text-xs font-bold tracking-widest text-marigold2 uppercase mb-1">Made To Order</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Build Your Own</h2>
            <p className="text-ink2 text-sm mt-1 mb-4">Choose exactly what you want.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {catalog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {catalog.products.length === 0 && (
                <p className="text-sm text-ink2">Loading treats…</p>
              )}
            </div>
          </div>
        </div>

        <DesktopOrderSummary>
          {totals.lineItems.length > 0 && (
            <Link
              href="/checkout"
              className="mt-4 block text-center rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-white font-semibold py-3 text-sm shadow-glow hover:brightness-105 transition-all"
            >
              Continue to Checkout
            </Link>
          )}
        </DesktopOrderSummary>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-paper2/60 border-y border-line">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink text-center mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="bg-white rounded-xl2 shadow-card p-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-oxblood to-oxblood2 text-white font-display text-sm font-semibold flex items-center justify-center mb-3 shadow-glow">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-ink text-sm">{step.title}</h3>
                <p className="text-sm text-ink2 mt-1 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / FOOTER */}
      <footer id="contact" className="max-w-6xl mx-auto px-5 md:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-display text-xl font-semibold text-ink">Treatsbox</p>
            <p className="text-sm text-ink2 mt-1 max-w-sm">
              Preorders close before Sunday. Orders are ready for collection after Church service.
            </p>
          </div>
          {settings?.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-oxblood underline underline-offset-4"
            >
              Message us on WhatsApp
            </a>
          )}
        </div>
        <p className="text-xs text-ink2/60 mt-8">© {new Date().getFullYear()} Treatsbox. All rights reserved.</p>
      </footer>

      <MobileOrderBar />
    </>
  );
}
