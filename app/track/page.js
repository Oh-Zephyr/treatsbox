"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteNav from "../components/SiteNav";
import StatusBadge from "../components/StatusBadge";
import { getOrderHistory } from "@/lib/orderHistory";
import { formatNaira, formatDate } from "@/lib/format";

export default function TrackOrderPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [lookupValue, setLookupValue] = useState("");
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    setHistory(getOrderHistory());
    setHydrated(true);
  }, []);

  // Refresh each remembered order's live status (the history list itself
  // only stores what it looked like when the order was placed).
  useEffect(() => {
    if (history.length === 0) return;
    let cancelled = false;
    Promise.all(
      history.map((h) =>
        fetch(`/api/orders/${h.orderNumber}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => [h.orderNumber, d?.order || null])
      )
    ).then((pairs) => {
      if (cancelled) return;
      const next = {};
      for (const [num, order] of pairs) next[num] = order;
      setStatuses(next);
    });
    return () => {
      cancelled = true;
    };
  }, [history]);

  const handleLookup = (e) => {
    e.preventDefault();
    const trimmed = lookupValue.trim().toUpperCase();
    if (!trimmed) {
      setLookupError("Enter your order number.");
      return;
    }
    router.push(`/order/${trimmed}`);
  };

  return (
    <>
      <SiteNav />
      <main className="max-w-lg mx-auto px-5 md:px-8 py-10 md:py-16">
        <p className="eyebrow mb-2">Order Status</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Track Your Order</h1>
        <p className="text-ink2 mb-8">Look up an order, or pick up one you&apos;ve placed on this device.</p>

        <form onSubmit={handleLookup} className="bg-white rounded-xl2 shadow-card p-5 mb-8">
          <label className="block">
            <span className="eyebrow mb-1.5 block">Order Number</span>
            <div className="flex gap-2">
              <input
                className="tb-field flex-1"
                placeholder="e.g. TB-0001"
                value={lookupValue}
                onChange={(e) => {
                  setLookupValue(e.target.value);
                  setLookupError("");
                }}
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold px-5 py-2.5 shadow-pop hover:brightness-105 transition-all shrink-0"
              >
                Find
              </button>
            </div>
          </label>
          {lookupError && <p className="text-xs text-alert mt-2">{lookupError}</p>}
        </form>

        {hydrated && history.length > 0 && (
          <div>
            <p className="eyebrow mb-3">Your Recent Orders on This Device</p>
            <div className="bg-white rounded-xl2 shadow-card divide-y divide-line">
              {history.map((h) => {
                const live = statuses[h.orderNumber];
                return (
                  <Link
                    key={h.orderNumber}
                    href={`/order/${h.orderNumber}`}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-paper2/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink tabular-nums">{h.orderNumber}</p>
                      <p className="text-xs text-ink2">{formatDate(h.createdAt)}</p>
                    </div>
                    <p className="font-semibold text-ink tabular-nums text-sm">{formatNaira(h.grandTotal)}</p>
                    {live && <StatusBadge kind="order" label={live.orderStatus} size="sm" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hydrated && history.length === 0 && (
          <p className="text-sm text-ink2 text-center">
            Orders you place on this device will show up here automatically — no account needed.
          </p>
        )}
      </main>
    </>
  );
}
