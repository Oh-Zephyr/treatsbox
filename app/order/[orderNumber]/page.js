"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import { formatNaira, formatDateTime } from "@/lib/format";

export default function OrderStatusPage() {
  const { orderNumber } = useParams();
  const searchParams = useSearchParams();
  const isFresh = searchParams.get("fresh") === "1";
  const showToast = useToast();

  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/orders/${orderNumber}`);
    if (!res.ok) {
      setNotFound(true);
      return;
    }
    const data = await res.json();
    setOrder(data.order);
  };

  useEffect(() => {
    load();
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  const handleSentReceipt = async () => {
    if (sendingReceipt) return;
    setSendingReceipt(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sent-receipt" }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        showToast("Thanks — we'll confirm your payment soon.");
      } else {
        showToast(data.error || "Something went wrong. Please try again.", "error");
      }
    } finally {
      setSendingReceipt(false);
    }
  };

  if (notFound) {
    return (
      <main className="max-w-md mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Order Not Found</h1>
        <p className="text-ink2 mb-6">We couldn&apos;t find an order with the number &ldquo;{orderNumber}&rdquo;.</p>
        <Link href="/" className="text-oxblood font-semibold underline underline-offset-4">Back to Treatsbox</Link>
      </main>
    );
  }

  if (!order || !settings) {
    return <main className="max-w-md mx-auto px-5 py-24 text-center text-ink2">Loading your order…</main>;
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Treatsbox,\n\nI have made payment for my order.\n\nOrder Number: ${order.orderNumber}\nName: ${order.customerName}\nAmount: ${formatNaira(order.grandTotal)}\n\nI am sending my payment receipt for verification.`
  );
  const whatsappHref = `https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`;

  const receiptSubmitted = order.receiptStatus === "Submitted";

  return (
    <main className="max-w-md mx-auto px-5 md:px-0 py-10 md:py-16">
      <div className="text-center mb-6 animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-forest">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          {isFresh ? "You're In The Queue!" : "Order Status"}
        </h1>
        <p className="text-ink2 mt-2">
          {isFresh
            ? "Your Treatsbox order has been successfully placed in the Sunday queue."
            : `Here's the latest on order ${order.orderNumber}.`}
        </p>
      </div>

      {/* Ticket stub — signature element */}
      <div className="relative animate-pop-in">
        <div className="bg-white rounded-xl2 shadow-pop overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-ink2/60 uppercase">Order Number</p>
                <p className="font-display text-2xl font-semibold text-ink tabular-nums">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold tracking-widest text-ink2/60 uppercase">Total</p>
                <p className="font-display text-xl font-semibold text-oxblood tabular-nums">{formatNaira(order.grandTotal)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <StatusBadge kind="order" label={order.orderStatus} />
              <StatusBadge kind="payment" label={order.paymentStatus} />
            </div>
          </div>

          <div className="relative ticket-edge">
            <span className="ticket-notch -left-3" />
            <span className="ticket-notch -right-3" />
          </div>

          <div className="p-6 pt-5 bg-paper2/40">
            <p className="text-sm text-ink2 leading-relaxed">
              {order.paymentStatus === "Not Verified" &&
                "Your order is already in the queue. To verify your payment, send your receipt to us on WhatsApp."}
              {order.paymentStatus === "Awaiting Confirmation" &&
                "Your receipt has been submitted. Treatsbox will confirm your payment shortly."}
              {order.paymentStatus === "Confirmed" &&
                "Your payment has been confirmed. Your order stays in the queue for Sunday."}
              {order.paymentStatus === "Rejected" &&
                "We couldn't verify your payment. Please send a clear receipt on WhatsApp, or contact us."}
            </p>
            <p className="text-sm text-ink2 mt-2">{settings.fulfillmentMessage}</p>
          </div>
        </div>
      </div>

      {order.orderStatus !== "Cancelled" && order.paymentStatus !== "Confirmed" && (
        <div className="mt-6 space-y-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-forest text-white font-semibold py-3.5 shadow-pop hover:bg-forest/90 transition-colors"
          >
            Send Receipt on WhatsApp
          </a>

          <div className="text-center">
            <p className="text-xs text-ink2 mb-2">Already sent your receipt?</p>
            <button
              onClick={handleSentReceipt}
              disabled={sendingReceipt || receiptSubmitted}
              className="w-full rounded-full border border-line text-ink font-semibold py-3.5 disabled:opacity-50"
            >
              {receiptSubmitted ? "Receipt Submitted ✓" : sendingReceipt ? "Submitting…" : "I've Sent My Receipt"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl2 shadow-card p-5">
        <h3 className="font-display text-base text-ink mb-3">Order Details</h3>
        <div className="divide-y divide-line text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2">
              <span className="text-ink2">{item.itemName} × {item.quantity}</span>
              <span className="text-ink font-medium tabular-nums">{formatNaira(item.total)}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-1 border-t border-line space-y-1 text-sm">
          <div className="flex justify-between text-ink2"><span>Subtotal</span><span className="tabular-nums">{formatNaira(order.subtotal)}</span></div>
          <div className="flex justify-between text-ink2"><span>Packaging</span><span className="tabular-nums">{formatNaira(order.packagingTotal)}</span></div>
          <div className="flex justify-between font-bold text-ink pt-1"><span>Grand Total</span><span className="tabular-nums">{formatNaira(order.grandTotal)}</span></div>
        </div>
        <p className="text-xs text-ink2/70 mt-3">Placed {formatDateTime(order.createdAt)}</p>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="text-sm font-semibold text-oxblood underline underline-offset-4">Back to Treatsbox</Link>
      </div>
    </main>
  );
}
