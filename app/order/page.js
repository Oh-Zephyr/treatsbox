"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../components/CartContext";
import SiteNav from "../components/SiteNav";
import PackageCard from "../components/PackageCard";
import ProductCard from "../components/ProductCard";
import { DesktopOrderSummary, MobileOrderBar } from "../components/OrderSummary";
import ClosedNotice from "../components/ClosedNotice";

export default function OrderPage() {
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

  return (
    <>
      <SiteNav />

      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16 md:pb-24">
        <div className="text-center max-w-lg mx-auto mb-12">
          <p className="eyebrow mb-2">Your Order</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">Build Your Box</h1>
          <p className="text-ink2 mt-2">Start with one of our favourites, or make it your own.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 md:gap-14">
          <div className="min-w-0">
            {/* Choose a pack */}
            <div className="mb-14">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="eyebrow mb-1">Ready-Made</p>
                  <h2 className="font-display text-2xl font-semibold text-ink">Pick a Pack</h2>
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
              <h2 className="font-display text-2xl font-semibold text-ink">Make It Yours</h2>
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
                className="mt-4 block text-center rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold py-3 text-sm shadow-pop hover:brightness-105 transition-all"
              >
                Continue to Checkout
              </Link>
            )}
          </DesktopOrderSummary>
        </div>
      </section>

      <MobileOrderBar />
    </>
  );
}
