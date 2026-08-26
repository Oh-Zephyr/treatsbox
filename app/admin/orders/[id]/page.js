"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "../../../components/StatusBadge";
import { formatNaira, formatDateTime, formatWeekdayDate } from "@/lib/format";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => fetch(`/api/admin/orders/${id}`).then((r) => r.json()).then((d) => setOrder(d.order));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doAction = async (action) => {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) setOrder(data.order);
    setBusy(false);
  };

  if (!order) return <p className="text-sm text-ink2">Loading order…</p>;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-ink2 hover:text-ink mb-4 inline-block">← Back to Orders</Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink tabular-nums">{order.orderNumber}</h1>
          <p className="text-sm text-ink2">Placed {formatDateTime(order.createdAt)} · Queue position #{order.queuePosition}</p>
          {order.collectionDate && (
            <p className="text-sm text-ink2">Ready for collection: <span className="font-semibold text-ink">{formatWeekdayDate(order.collectionDate)}</span></p>
          )}
        </div>
        <div className="flex gap-2">
          <StatusBadge kind="order" label={order.orderStatus} />
          <StatusBadge kind="payment" label={order.paymentStatus} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <h3 className="font-display text-base text-ink mb-3">Customer</h3>
          <dl className="text-sm space-y-1.5">
            <Row label="Name" value={order.customerName} />
            <Row label="Phone" value={order.phone} />
            <Row label="WhatsApp" value={order.whatsapp} />
            <Row label="Email" value={order.email} />
            {order.notes && <Row label="Note" value={order.notes} />}
          </dl>
        </div>
        <div className="bg-white rounded-xl2 shadow-card p-5">
          <h3 className="font-display text-base text-ink mb-3">Payment</h3>
          <dl className="text-sm space-y-1.5">
            <Row label="Payment Status" value={order.paymentStatus} />
            <Row label="Receipt Status" value={order.receiptStatus} />
            <Row label="Grand Total" value={formatNaira(order.grandTotal)} />
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-5 mb-4">
        <h3 className="font-display text-base text-ink mb-3">Order Items</h3>
        <div className="divide-y divide-line text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2">
              <span className="text-ink2">{item.itemName} × {item.quantity} @ {formatNaira(item.unitPrice)}</span>
              <span className="text-ink font-medium tabular-nums">{formatNaira(item.total)}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-1 border-t border-line space-y-1 text-sm">
          <div className="flex justify-between text-ink2"><span>Subtotal</span><span className="tabular-nums">{formatNaira(order.subtotal)}</span></div>
          <div className="flex justify-between text-ink2"><span>Packaging</span><span className="tabular-nums">{formatNaira(order.packagingTotal)}</span></div>
          <div className="flex justify-between font-bold text-ink pt-1"><span>Grand Total</span><span className="tabular-nums">{formatNaira(order.grandTotal)}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-5">
        <h3 className="font-display text-base text-ink mb-3">Actions</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton disabled={busy || order.paymentStatus === "Confirmed"} onClick={() => doAction("confirm-payment")} tone="forest">Confirm Payment</ActionButton>
          <ActionButton disabled={busy || order.paymentStatus === "Rejected"} onClick={() => doAction("reject-payment")} tone="alert">Reject Payment</ActionButton>
          <ActionButton disabled={busy || order.orderStatus === "Ready for Collection"} onClick={() => doAction("mark-ready")} tone="ink">Mark Ready</ActionButton>
          <ActionButton disabled={busy || order.orderStatus === "Completed"} onClick={() => doAction("mark-completed")} tone="ink">Mark Completed</ActionButton>
          <ActionButton disabled={busy || order.orderStatus === "Cancelled"} onClick={() => doAction("cancel-order")} tone="alert">Cancel Order</ActionButton>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink2">{label}</dt>
      <dd className="text-ink font-medium text-right">{value}</dd>
    </div>
  );
}

function ActionButton({ children, onClick, disabled, tone }) {
  const tones = {
    forest: "bg-forest text-white",
    alert: "bg-alert text-white",
    ink: "border border-line text-ink",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-opacity ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
