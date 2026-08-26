import { formatDateTime } from "@/lib/format";

export default function ClosedNotice({ settings }) {
  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-paper2 flex items-center justify-center mx-auto mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-oxblood">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12h6" />
        </svg>
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-3">Treatsbox Preorders Are Closed</h1>
      <p className="text-ink2 leading-relaxed">
        We&apos;ve reached the limit for this Sunday&apos;s orders. Please check back for the next preorder window.
      </p>
      {settings?.cutoffAt && (
        <p className="text-sm text-ink2 mt-2">Orders reopen around {formatDateTime(settings.cutoffAt)}.</p>
      )}
      {settings?.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 mt-6 rounded-full bg-oxblood text-white font-semibold px-5 py-3 shadow-pop"
        >
          Message Us on WhatsApp
        </a>
      )}
    </div>
  );
}
