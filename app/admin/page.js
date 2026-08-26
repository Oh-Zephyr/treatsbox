"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format";

const CARDS = [
  { key: "totalOrders", label: "Total Orders" },
  { key: "pendingVerification", label: "Pending Verification" },
  { key: "awaitingConfirmation", label: "Awaiting Confirmation" },
  { key: "confirmedPayments", label: "Confirmed Payments" },
  { key: "queuedOrders", label: "Queued Orders" },
  { key: "readyOrders", label: "Ready Orders" },
  { key: "completedOrders", label: "Completed Orders" },
  { key: "totalRevenue", label: "Total Revenue", isMoney: true },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((c) => (
          <div key={c.key} className="bg-white rounded-xl2 shadow-card p-4">
            <p className="text-xs font-medium text-ink2">{c.label}</p>
            <p className="font-display text-2xl font-semibold text-ink mt-1 tabular-nums">
              {stats ? (c.isMoney ? formatNaira(stats[c.key]) : stats[c.key]) : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <p className="text-xs font-medium text-ink2">Orders This Week</p>
          <p className="font-display text-3xl font-semibold text-ink mt-1 tabular-nums">{stats?.ordersThisWeek ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <p className="text-xs font-medium text-ink2">Average Order Value</p>
          <p className="font-display text-3xl font-semibold text-ink mt-1 tabular-nums">
            {stats ? formatNaira(stats.averageOrderValue) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <p className="text-xs font-medium text-ink2 mb-2">Most Popular Packages</p>
          {stats?.mostPopularPackages?.length ? (
            <ul className="text-sm space-y-1">
              {stats.mostPopularPackages.map((p) => (
                <li key={p.name} className="flex justify-between text-ink">
                  <span>{p.name}</span><span className="font-semibold tabular-nums">{p.qty}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink2">No orders yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-5 mt-4">
        <p className="text-xs font-medium text-ink2 mb-2">Most Ordered Products</p>
        {stats?.mostOrderedProducts?.length ? (
          <ul className="text-sm grid sm:grid-cols-2 gap-x-8 gap-y-1">
            {stats.mostOrderedProducts.map((p) => (
              <li key={p.name} className="flex justify-between text-ink">
                <span>{p.name}</span><span className="font-semibold tabular-nums">{p.qty}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink2">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
