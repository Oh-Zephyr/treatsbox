"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../../components/Toast";
import { formatNaira } from "@/lib/format";

export default function UploadReceiptPage() {
  const { orderNumber } = useParams();
  const router = useRouter();
  const showToast = useToast();

  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const [showWhatsappOption, setShowWhatsappOption] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setOrder(d.order))
      .catch(() => setNotFound(true));
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, [orderNumber]);

  // If a receipt is already handled (submitted, or payment already moved
  // past needing one), there's nothing to ask for here — send them
  // straight to their order status instead of this page.
  useEffect(() => {
    if (!order) return;
    if (order.receiptStatus === "Submitted" || order.paymentStatus === "Confirmed") {
      router.replace(`/order/${orderNumber}`);
    }
  }, [order, orderNumber, router]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast("That file is too large (max 8MB).", "error");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`/api/orders/${orderNumber}/receipt`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Receipt uploaded — we'll confirm your payment soon.");
        router.push("/track");
      } else {
        showToast(data.error || "Something went wrong uploading your receipt.", "error");
      }
    } catch {
      showToast("Something went wrong uploading your receipt. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

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
        showToast("Thanks — we'll confirm your payment soon.");
        router.push("/track");
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
    return <main className="max-w-md mx-auto px-5 py-24 text-center text-ink2">Loading…</main>;
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Treatsbox,\n\nI have made payment for my order.\n\nOrder Number: ${order.orderNumber}\nName: ${order.customerName}\nAmount: ${formatNaira(order.grandTotal)}\n\nI am sending my payment receipt for verification.`
  );
  const whatsappHref = `https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main className="max-w-md mx-auto px-5 md:px-0 py-12 md:py-16">
      <div className="text-center mb-6 animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-forest/20 to-marigold/20 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-forest">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="eyebrow mb-2">Order {order.orderNumber} · {formatNaira(order.grandTotal)}</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Upload Your Receipt</h1>
        <p className="text-ink2 mt-2">
          You&apos;re already in the queue. Upload a photo or screenshot of your bank transfer so we can verify your payment.
        </p>
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-5 animate-pop-in">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-ink2 file:mr-3 file:rounded-full file:border-0 file:bg-paper2 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-paper2/70"
        />
        <p className="text-xs text-ink2 mt-2">JPG, PNG, WEBP, HEIC, or PDF — up to 8MB.</p>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper font-semibold py-3.5 shadow-pop hover:brightness-105 transition-all disabled:opacity-50"
        >
          {uploading ? "Uploading…" : selectedFile ? `Upload ${selectedFile.name}` : "Choose a file first"}
        </button>
      </div>

      <div className="text-center mt-5">
        {!showWhatsappOption ? (
          <button
            onClick={() => setShowWhatsappOption(true)}
            className="text-xs font-semibold text-ink2 underline underline-offset-4"
          >
            Prefer to send it on WhatsApp instead?
          </button>
        ) : (
          <div className="space-y-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-forest to-forest/80 text-white font-semibold py-3.5 shadow-pop hover:brightness-105 transition-all"
            >
              Send Receipt on WhatsApp
            </a>
            <button
              onClick={handleSentReceipt}
              disabled={sendingReceipt}
              className="w-full rounded-full border border-line text-ink font-semibold py-3.5 disabled:opacity-50"
            >
              {sendingReceipt ? "Submitting…" : "I've Sent My Receipt"}
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <Link href={`/order/${order.orderNumber}`} className="text-sm font-semibold text-oxblood underline underline-offset-4">
          View Full Order Status
        </Link>
      </div>
    </main>
  );
}
