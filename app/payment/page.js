"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FlowHeader from "../components/FlowHeader";
import { useCart } from "../components/CartContext";
import { useToast } from "../components/Toast";
import { SummaryTotals } from "../components/OrderSummary";
import { formatNaira } from "@/lib/format";
import { addOrderToHistory } from "@/lib/orderHistory";

const PENDING_KEY = "treatsbox_pending_order_key";

export default function PaymentPage() {
  const router = useRouter();
  const showToast = useToast();
  const { customer, items, totals, hydrated, clearCart } = useCart();
  const [settings, setSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      router.replace("/order");
    } else if (!customer.name || !customer.email) {
      router.replace("/checkout");
    }
  }, [hydrated, totals.lineItems.length, customer, router]);

  const copyAccount = async () => {
    if (!settings?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(settings.accountNumber);
      showToast("Account number copied");
    } catch {
      showToast("Couldn't copy — please copy it manually", "error");
    }
  };

  const handleIHavePaid = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");

    let idempotencyKey = window.localStorage.getItem(PENDING_KEY);
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      window.localStorage.setItem(PENDING_KEY, idempotencyKey);
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items, idempotencyKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong while submitting your order. Please try again.");
        setSubmitting(false);
        return;
      }
      window.localStorage.removeItem(PENDING_KEY);
      addOrderToHistory(data.order);
      clearCart();
      router.push(`/order/${data.order.orderNumber}?fresh=1`);
    } catch {
      setError("Something went wrong. Your order has not been lost — please try again.");
      setSubmitting(false);
    }
  };

  if (!hydrated || items.length === 0 || !settings) return null;

  return (
    <>
      <FlowHeader step={4} />
      <main className="max-w-lg mx-auto px-5 md:px-8 py-10">
        <p className="eyebrow mb-2">One Last Step</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Payment</h1>
        <p className="text-sm text-ink2 mb-8">Transfer the exact amount below, then confirm you&apos;ve paid.</p>

        <div className="bg-white rounded-xl2 shadow-card p-5 mb-5">
          <dl className="space-y-3 text-sm">
            <Row label="Bank" value={settings.bankName} />
            <Row label="Account Name" value={settings.accountName} />
            <Row
              label="Account Number"
              value={
                <span className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{settings.accountNumber}</span>
                  <button
                    onClick={copyAccount}
                    className="text-xs font-semibold text-oxblood border border-oxblood/30 rounded-full px-2.5 py-1 hover:bg-oxblood/5"
                  >
                    Copy
                  </button>
                </span>
              }
            />
            <Row label="Amount" value={<span className="font-display text-lg font-semibold text-oxblood">{formatNaira(totals.grandTotal)}</span>} />
          </dl>
        </div>

        <SummaryTotals />

        <p className="text-sm text-ink2 mt-6 mb-4">After making your transfer, click the button below.</p>

        {error && (
          <p className="text-sm text-alert bg-alert/10 rounded-xl px-4 py-3 mb-4">{error}</p>
        )}

        <button
          onClick={handleIHavePaid}
          disabled={submitting}
          className="w-full rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold py-4 shadow-pop hover:shadow-pop transition-all disabled:opacity-60"
        >
          {submitting ? "Placing your order…" : "I Have Paid"}
        </button>
      </main>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink2">{label}</dt>
      <dd className="text-ink text-right">{value}</dd>
    </div>
  );
}
