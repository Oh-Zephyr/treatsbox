"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import { formatNaira } from "@/lib/format";

export default function AdminQueuePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders?orderStatus=Queued")
      .then((r) => r.json())
      .then((d) => setOrders((d.orders || []).sort((a, b) => a.queuePosition - b.queuePosition)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Sunday Order Queue</h1>
      <p className="text-sm text-ink2 mb-6">Everyone currently queued for this Sunday&apos;s collection.</p>

      {loading ? (
        <p className="text-sm text-ink2">Loading queue…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-ink2 bg-white rounded-xl2 shadow-card p-8 text-center">No one is queued yet.</p>
      ) : (
        <div className="bg-white rounded-xl2 shadow-card divide-y divide-line">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper2/30">
              <span className="font-display text-lg font-semibold text-ink2 w-8 text-center">{o.queuePosition}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink tabular-nums">{o.orderNumber} <span className="text-ink2 font-normal">— {o.customerName}</span></p>
              </div>
              <p className="font-semibold text-ink tabular-nums hidden sm:block">{formatNaira(o.grandTotal)}</p>
              <StatusBadge kind="payment" label={o.paymentStatus} size="sm" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
