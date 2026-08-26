"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatNaira } from "@/lib/format";
import QtyStepper from "./QtyStepper";
import FoodVisual from "./FoodVisual";

function lineVisual(item, catalog) {
  if (item.itemType === "package") {
    return catalog.packages.find((p) => p.id === item.refId);
  }
  return catalog.products.find((p) => p.id === item.refId);
}

function SummaryLines({ compact }) {
  const { totals, catalog, increment, decrement, removeItem } = useCart();

  if (totals.lineItems.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <p className="font-display text-lg text-ink mb-1">Your order is empty.</p>
        <p className="text-sm text-ink2 mb-4">Choose a package or add some individual treats.</p>
        <a href="#order" className="inline-flex text-sm font-semibold text-oxblood underline underline-offset-4">
          Start Ordering
        </a>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      {totals.lineItems.map((item) => (
        <div key={`${item.itemType}:${item.refId}`} className="flex items-center gap-3 py-3">
          <FoodVisual imageUrl={lineVisual(item, catalog)?.imageUrl} iconName={lineVisual(item, catalog)?.image} alt={item.itemName} variant="row" className="w-11 h-11 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{item.itemName}</p>
            <p className="text-xs text-ink2">{formatNaira(item.unitPrice)} each</p>
          </div>
          {!compact ? (
            <QtyStepper
              size="sm"
              value={item.quantity}
              onIncrement={() => increment(item.itemType, item.refId)}
              onDecrement={() => decrement(item.itemType, item.refId)}
            />
          ) : (
            <span className="text-sm text-ink2">×{item.quantity}</span>
          )}
          <p className="w-20 text-right text-sm font-semibold text-ink tabular-nums">{formatNaira(item.total)}</p>
          {!compact && (
            <button
              onClick={() => removeItem(item.itemType, item.refId)}
              aria-label={`Remove ${item.itemName}`}
              className="text-ink2/50 hover:text-alert transition-colors text-lg leading-none px-1"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function SummaryTotals() {
  const { totals } = useCart();
  return (
    <div className="pt-3 space-y-1.5 text-sm">
      <div className="flex justify-between text-ink2">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatNaira(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between text-ink2">
        <span>Packaging</span>
        <span className="tabular-nums">{formatNaira(totals.packagingTotal)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-ink pt-1.5 border-t border-line mt-1.5">
        <span>Grand Total</span>
        <span className="tabular-nums">{formatNaira(totals.grandTotal)}</span>
      </div>
    </div>
  );
}

export function DesktopOrderSummary({ children }) {
  const { totals, clearCart } = useCart();
  return (
    <aside className="hidden lg:block sticky top-24 self-start w-full">
      <div className="bg-white rounded-xl2 shadow-card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg text-ink">Your Order</h3>
          {totals.lineItems.length > 0 && (
            <button onClick={clearCart} className="text-xs font-medium text-ink2 hover:text-alert transition-colors">
              Clear order
            </button>
          )}
        </div>
        <SummaryLines />
        {totals.lineItems.length > 0 && <SummaryTotals />}
        {children}
      </div>
    </aside>
  );
}

export function MobileOrderBar() {
  const [open, setOpen] = useState(false);
  const { totals, itemCount, clearCart } = useCart();

  if (itemCount === 0) return null;

  return (
    <>
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-ink text-paper rounded-full shadow-pop px-5 py-3.5 flex items-center justify-between font-semibold"
        >
          <span className="flex items-center gap-2">
            <span className="bg-marigold text-ink text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
            Your Order
          </span>
          <span className="tabular-nums">{formatNaira(totals.grandTotal)} · View</span>
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="relative w-full bg-paper rounded-t-2xl shadow-pop max-h-[80vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="font-display text-lg text-ink">Your Order</h3>
              <button onClick={() => setOpen(false)} className="text-ink2 text-2xl leading-none px-2">
                ×
              </button>
            </div>
            <div className="overflow-y-auto px-5 flex-1">
              <SummaryLines />
            </div>
            <div className="px-5 pb-4 pt-2 border-t border-line bg-paper">
              <SummaryTotals />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={clearCart}
                  className="flex-1 rounded-full border border-line text-ink2 font-semibold py-3 text-sm"
                >
                  Clear
                </button>
                <Link
                  href="/checkout"
                  className="flex-[2] text-center rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-white font-semibold py-3 text-sm shadow-glow"
                >
                  Continue to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { SummaryLines };
