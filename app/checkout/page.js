"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FlowHeader from "../components/FlowHeader";
import { useCart } from "../components/CartContext";
import { SummaryLines, SummaryTotals } from "../components/OrderSummary";

export default function CheckoutPage() {
  const router = useRouter();
  const { customer, setCustomer, totals, hydrated, items } = useCart();
  const [form, setForm] = useState(customer);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(customer);
  }, [customer]);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/#order");
    }
  }, [hydrated, totals.lineItems.length, router]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Enter your full name.";
    if (!form.phone?.trim()) errs.phone = "Enter your phone number.";
    if (!form.whatsapp?.trim()) errs.whatsapp = "Enter your WhatsApp number.";
    if (!form.email?.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setCustomer(form);
    router.push("/review");
  };

  if (!hydrated) return null;

  return (
    <>
      <FlowHeader step={2} />
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 grid md:grid-cols-[1fr_280px] gap-8">
        <form onSubmit={handleContinue} className="min-w-0">
          <p className="eyebrow mb-2">Almost There</p>
          <h1 className="font-display text-3xl font-semibold text-ink mb-1">Your Details</h1>
          <p className="text-sm text-ink2 mb-8">Just enough to confirm and reach you about your order.</p>

          <div className="space-y-4">
            <Field label="Full Name" error={errors.name}>
              <input
                value={form.name || ""}
                onChange={update("name")}
                placeholder="e.g. Ada Obi"
                className="tb-field"
                autoComplete="name"
              />
            </Field>
            <Field label="Phone Number" error={errors.phone}>
              <input
                value={form.phone || ""}
                onChange={update("phone")}
                placeholder="080..."
                inputMode="tel"
                className="tb-field"
                autoComplete="tel"
              />
            </Field>
            <Field label="WhatsApp Number" error={errors.whatsapp}>
              <input
                value={form.whatsapp || ""}
                onChange={update("whatsapp")}
                placeholder="080... (for your receipt)"
                inputMode="tel"
                className="tb-field"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                value={form.email || ""}
                onChange={update("email")}
                placeholder="you@email.com"
                type="email"
                className="tb-field"
                autoComplete="email"
              />
            </Field>
            <Field label="Order Note (optional)">
              <textarea
                value={form.notes || ""}
                onChange={update("notes")}
                placeholder="Anything we should know?"
                rows={3}
                className="tb-field resize-none"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="mt-9 w-full md:w-auto rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold px-8 py-4 shadow-pop hover:shadow-pop transition-all"
          >
            Continue to Review
          </button>
        </form>

        <aside className="bg-white rounded-xl2 shadow-card p-5 h-fit">
          <h3 className="font-display text-base text-ink mb-1">Order Summary</h3>
          <SummaryLines compact />
          <SummaryTotals />
        </aside>
      </main>
    </>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-xs text-alert mt-1 block">{error}</span>}
    </label>
  );
}
