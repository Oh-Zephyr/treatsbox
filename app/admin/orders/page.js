"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import { formatNaira, formatDate } from "@/lib/format";

const ORDER_STATUSES = ["Queued", "Ready for Collection", "Completed", "Cancelled"];
const PAYMENT_STATUSES = ["Not Verified", "Awaiting Confirmation", "Confirmed", "Rejected"];
const RECEIPT_STATUSES = ["Not Submitted", "Submitted"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [q, setQ] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (orderStatus) params.set("orderStatus", orderStatus);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (receiptStatus) params.set("receiptStatus", receiptStatus);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    // A faster, more recent request may have already resolved while this
    // one was in flight (e.g. typing quickly on a slow connection) --
    // discard this response rather than let stale results flash in.
    if (requestId !== requestIdRef.current) return;
    setOrders(data.orders || []);
    setLoading(false);
    setHasLoadedOnce(true);
  }, [q, orderStatus, paymentStatus, receiptStatus]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, order ID"
          className="tb-input flex-1 min-w-[180px]"
        />
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="tb-input w-auto">
          <option value="">All Order Status</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="tb-input w-auto">
          <option value="">All Payment Status</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={receiptStatus} onChange={(e) => setReceiptStatus(e.target.value)} className="tb-input w-auto">
          <option value="">All Receipt Status</option>
          {RECEIPT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && !hasLoadedOnce ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl2 shadow-card p-4 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-paper2 rounded w-24" />
                  <div className="h-3 bg-paper2 rounded w-40" />
                </div>
                <div className="h-3 bg-paper2 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-ink2 bg-white rounded-xl2 shadow-card p-8 text-center">No orders yet.</p>
      ) : (
        <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl2 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper2/50 text-ink2 text-left">
                <tr>
                  {["Order ID", "Customer", "Phone", "Date", "Total", "Order Status", "Payment", "Receipt", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-paper2/30">
                    <td className="px-4 py-3 font-semibold text-ink tabular-nums">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-ink">{o.customerName}</td>
                    <td className="px-4 py-3 text-ink2">{o.phone}</td>
                    <td className="px-4 py-3 text-ink2">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-ink font-semibold tabular-nums">{formatNaira(o.grandTotal)}</td>
                    <td className="px-4 py-3"><StatusBadge kind="order" label={o.orderStatus} size="sm" /></td>
                    <td className="px-4 py-3"><StatusBadge kind="payment" label={o.paymentStatus} size="sm" /></td>
                    <td className="px-4 py-3 text-ink2">{o.receiptStatus}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-oxblood font-semibold text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="block bg-white rounded-xl2 shadow-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-ink tabular-nums">{o.orderNumber}</p>
                    <p className="text-sm text-ink2">{o.customerName}</p>
                  </div>
                  <p className="font-semibold text-ink tabular-nums">{formatNaira(o.grandTotal)}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <StatusBadge kind="order" label={o.orderStatus} size="sm" />
                  <StatusBadge kind="payment" label={o.paymentStatus} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
