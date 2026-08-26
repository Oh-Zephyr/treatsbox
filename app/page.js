"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./components/CartContext";
import SiteNav from "./components/SiteNav";
import PackageCard from "./components/PackageCard";
import ProductCard from "./components/ProductCard";
import FoodVisual from "./components/FoodVisual";
import { DesktopOrderSummary, MobileOrderBar } from "./components/OrderSummary";
import ClosedNotice from "./components/ClosedNotice";

const HOW_IT_WORKS = [
  { title: "Pick your treats", body: "Choose a pack or build your own from individual items." },
  { title: "Make your payment", body: "Transfer the exact amount shown to the account we give you." },
  { title: "Send your receipt", body: "Send it to us on WhatsApp so we can verify it." },
  { title: "You're in", body: "Your order is queued and ready for Sunday, after Church service." },
];

export default function HomePage() {
  const { catalog, totals } = useCart();
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

  const heroPack = catalog.packages[0];

  return (
    <>
      <SiteNav />

      {/* HERO — food first, editorial two-column composition */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Image first on mobile, right column on desktop */}
          <div className="relative order-1 md:order-2">
            {/* A solid packaging-card shadow behind the food, not a gradient blob */}
            <div className="absolute -bottom-3 -right-3 w-full h-full bg-marigold/25 rounded-blob -z-10" />
            <div className="relative">
              <FoodVisual
                imageUrl={heroPack?.imageUrl}
                iconName={heroPack?.image || "chickenpack"}
                alt={heroPack?.name || "Treatsbox pack"}
                variant="hero"
                shapeIndex={0}
                className="w-full aspect-square md:aspect-[4/5]"
              />
              {heroPack && (
                <div className="absolute -bottom-4 left-4 md:left-6 bg-white rounded-full pl-1.5 pr-4 py-1.5 shadow-pop flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-marigold/20 flex items-center justify-center text-xs font-display font-semibold text-oxblood">
                    ★
                  </span>
                  <span className="text-xs font-semibold text-ink">Sunday Special · {heroPack.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Copy */}
          <div className="order-2 md:order-1">
            <p className="eyebrow mb-4">Sunday Preorders</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] font-semibold text-ink leading-[1.06] tracking-tight">
              Good food deserves a better box.
            </h1>
            <p className="text-ink2 text-lg mt-5 max-w-md leading-relaxed">
              Pick a ready-made pack or create one exactly the way you want it.
            </p>
            <Link
              href="#order"
              className="inline-flex mt-8 rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold px-8 py-4 shadow-pop hover:shadow-pop hover:-translate-y-0.5 transition-all"
            >
              Start Your Order
            </Link>

            <div className="mt-10 pt-8 border-t border-line max-w-md">
              <p className="font-display italic text-lg text-ink">Made for the moments worth sharing.</p>
              <p className="text-sm text-ink2 mt-2">
                Samosas. Spring rolls. Puff puff. Beef. Chicken. Pick your favourites and build your box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ORDER EXPERIENCE */}
      <section id="order" className="max-w-6xl mx-auto px-5 md:px-8 pb-16 md:pb-24">
        <div className="text-center max-w-lg mx-auto mb-12">
          <p className="eyebrow mb-2">Your Order</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Build Your Box</h2>
          <p className="text-ink2 mt-2">Start with one of our favourites, or make it your own.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 md:gap-14">
          <div className="min-w-0">
            {/* Choose a pack */}
            <div className="mb-14">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="eyebrow mb-1">Ready-Made</p>
                  <h3 className="font-display text-2xl font-semibold text-ink">Pick a Pack</h3>
                  <p className="text-ink2 text-sm mt-1">Everything already figured out.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-10">
                {catalog.packages.map((pkg, i) => (
                  <PackageCard key={pkg.id} pkg={pkg} index={i} />
                ))}
                {catalog.packages.length === 0 && <p className="text-sm text-ink2">Loading packs…</p>}
              </div>
            </div>

            {/* Build your own */}
            <div>
              <p className="eyebrow mb-1">Custom</p>
              <h3 className="font-display text-2xl font-semibold text-ink">Make It Yours</h3>
              <p className="text-ink2 text-sm mt-1 mb-4">Pick the treats you want — we&apos;ll take care of the rest.</p>
              <div>
                {catalog.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {catalog.products.length === 0 && <p className="text-sm text-ink2">Loading treats…</p>}
              </div>
            </div>
          </div>

          <DesktopOrderSummary>
            {totals.lineItems.length > 0 && (
              <Link
                href="/checkout"
                className="mt-4 block text-center rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold py-3 text-sm shadow-pop hover:shadow-pop transition-all"
              >
                Continue to Checkout
              </Link>
            )}
          </DesktopOrderSummary>
        </div>
      </section>

      {/* HOW IT WORKS — editorial vertical story, not four boxed cards */}
      <section id="how-it-works" className="border-y border-line bg-paper2/50">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-16 md:py-20">
          <p className="eyebrow text-center mb-2">The Process</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink text-center mb-12">How It Works</h2>
          <div className="divide-y divide-line">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-6 py-6">
                <span className="font-display text-3xl md:text-4xl font-semibold text-marigold/60 tabular-nums shrink-0 w-10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="text-sm text-ink2 mt-1 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUNDAY MOMENT — a deliberate contrast break in the page rhythm */}
      <section className="bg-ink">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-16 md:py-20 text-center">
          <p className="font-display italic text-2xl md:text-3xl text-paper">See you Sunday.</p>
          <p className="text-paper/70 mt-3 max-w-md mx-auto leading-relaxed">
            Place your preorder and your Treatsbox will be ready to be received after Church service.
          </p>
        </div>
      </section>

      {/* FOOTER — simple and premium */}
      <footer id="contact" className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="font-display text-xl font-semibold text-ink">Treatsbox</p>
            <p className="text-sm text-ink2 mt-1">Your Sunday treat, sorted.</p>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold text-ink">
            <Link href="#order" className="hover:text-oxblood transition-colors">Order</Link>
            <a href="#contact" className="hover:text-oxblood transition-colors">Contact</a>
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-oxblood transition-colors"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <p className="text-xs text-ink2/60 mt-8">© {new Date().getFullYear()} Treatsbox. All rights reserved.</p>
      </footer>

      <MobileOrderBar />
    </>
  );
}
