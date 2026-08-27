"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FlowHeader from "../../components/FlowHeader";
import { useCart } from "../../components/CartContext";
import { formatNaira } from "@/lib/format";
import { addOrderToHistory } from "@/lib/orderHistory";

const PENDING_KEY = "treatsbox_pending_order_key";

// The order does not exist yet at this point -- it's created only once a
// receipt is successfully attached (see POST /api/orders). This page has
// no order number in its URL for exactly that reason: there's nothing to
// reference yet. There is deliberately no way to skip or bypass this step.
export default function UploadReceiptToCompleteOrderPage() {
  const router = useRouter();
  const { customer, items, totals, hydrated, clearCart } = useCart();

  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      router.replace("/order");
    } else if (!customer.name || !customer.email) {
      router.replace("/checkout");
    }
  }, [hydrated, items.length, customer, router]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("That file is too large (max 8MB). Please use a smaller photo.");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || submitting) return;
    setSubmitting(true);
    setError("");

    let idempotencyKey = window.localStorage.getItem(PENDING_KEY);
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      window.localStorage.setItem(PENDING_KEY, idempotencyKey);
    }

    try {
      const formData = new FormData();
      formData.append("customer", JSON.stringify(customer));
      formData.append("items", JSON.stringify(items));
      formData.append("idempotencyKey", idempotencyKey);
      formData.append("file", selectedFile);

      const res = await fetch("/api/orders", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong while submitting your order. Please try again.");
        setSubmitting(false);
        return;
      }

      window.localStorage.removeItem(PENDING_KEY);
      addOrderToHistory(data.order);
      clearCart();
      router.push("/track");
    } catch {
      setError("Something went wrong uploading your receipt. Your order has not been created — please try again.");
      setSubmitting(false);
    }
  };

  if (!hydrated || items.length === 0) return null;

  return (
    <>
      <FlowHeader step={5} />
      <main className="max-w-lg mx-auto px-5 md:px-8 py-10">
        <p className="eyebrow mb-2">Last Step</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Upload Your Receipt</h1>
        <p className="text-sm text-ink2 mb-8">
          Your order isn&apos;t placed until we have your receipt — upload a photo or screenshot of your bank transfer to complete it.
        </p>

        <div className="bg-white rounded-xl2 shadow-card p-5 mb-5">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-line">
            <span className="text-sm text-ink2">Amount Paid</span>
            <span className="font-display text-lg font-semibold text-oxblood tabular-nums">{formatNaira(totals.grandTotal)}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-ink2 file:mr-3 file:rounded-full file:border-0 file:bg-paper2 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-paper2/70"
          />
          <p className="text-xs text-ink2 mt-2">JPG, PNG, WEBP, HEIC, or PDF — up to 8MB.</p>

          {error && <p className="text-sm text-alert bg-alert/10 rounded-xl px-4 py-3 mt-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || submitting}
            className="mt-5 w-full rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold py-4 shadow-pop hover:brightness-105 transition-all disabled:opacity-50"
          >
            {submitting ? "Completing your order…" : selectedFile ? `Upload & Complete Order` : "Choose a file to continue"}
          </button>
        </div>

        <p className="text-xs text-ink2 text-center">
          Your receipt is attached directly to your order for us to verify — nothing else to send separately.
        </p>
      </main>
    </>
  );
}
