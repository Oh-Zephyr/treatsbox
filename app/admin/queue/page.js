"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import { formatNaira, formatWeekdayDate } from "@/lib/format";

export default function AdminQueuePage() {
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders?orderStatus=Queued")
      .then((r) => r.json())
      .then((d) => setOrders((d.orders || []).sort((a, b) => a.queuePosition - b.queuePosition)))
      .finally(() => setLoading(false));
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Order Queue</h1>
      <p className="text-sm text-ink2 mb-6">
        {settings?.nextPreorderDate
          ? `Everyone currently queued for ${formatWeekdayDate(settings.nextPreorderDate)}.`
          : "Everyone currently queued for the next collection date."}
      </p>

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
                {o.collectionDate && (
                  <p className="text-xs text-ink2/70">{formatWeekdayDate(o.collectionDate)}</p>
                )}
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
