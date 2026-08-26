"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FlowHeader from "../components/FlowHeader";
import { useCart } from "../components/CartContext";
import { SummaryLines, SummaryTotals } from "../components/OrderSummary";

export default function ReviewPage() {
  const router = useRouter();
  const { customer, totals, hydrated, items } = useCart();

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      router.replace("/order");
    } else if (!customer.name || !customer.email) {
      router.replace("/checkout");
    }
  }, [hydrated, totals.lineItems.length, customer, router]);

  if (!hydrated || items.length === 0) return null;

  return (
    <>
      <FlowHeader step={3} />
      <main className="max-w-2xl mx-auto px-5 md:px-8 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Review Your Order</h1>
        <p className="text-sm text-ink2 mb-6">Make sure everything looks right before you pay.</p>

        <div className="bg-white rounded-xl2 shadow-card p-5 mb-5">
          <h3 className="font-display text-base text-ink mb-3">Customer Details</h3>
          <dl className="grid grid-cols-[100px_1fr] gap-y-1.5 text-sm">
            <dt className="text-ink2">Name</dt>
            <dd className="text-ink font-medium">{customer.name}</dd>
            <dt className="text-ink2">Phone</dt>
            <dd className="text-ink font-medium">{customer.phone}</dd>
            <dt className="text-ink2">WhatsApp</dt>
            <dd className="text-ink font-medium">{customer.whatsapp}</dd>
            <dt className="text-ink2">Email</dt>
            <dd className="text-ink font-medium">{customer.email}</dd>
            {customer.notes && (
              <>
                <dt className="text-ink2">Note</dt>
                <dd className="text-ink font-medium">{customer.notes}</dd>
              </>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl2 shadow-card p-5 mb-7">
          <h3 className="font-display text-base text-ink mb-1">Order Items</h3>
          <SummaryLines compact />
          <SummaryTotals />
        </div>

        <div className="flex gap-3">
          <Link
            href="/checkout"
            className="flex-1 text-center rounded-full border border-line text-ink font-semibold py-3.5 hover:bg-paper2/60 transition-colors"
          >
            Edit Order
          </Link>
          <Link
            href="/payment"
            className="flex-[2] text-center rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-white font-semibold py-3.5 shadow-pop hover:brightness-105 transition-all"
          >
            Continue to Payment
          </Link>
        </div>
      </main>
    </>
  );
}
