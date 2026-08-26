"use client";

import { useEffect, useState } from "react";
import { formatWeekdayDate } from "@/lib/format";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <p className="text-sm text-ink2">Loading settings…</p>;

  const set = (field) => (e) => setSettings({ ...settings, [field]: e.target.value });

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Settings</h1>

      <div className="bg-white rounded-xl2 shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between bg-paper2/50 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink">Accept New Orders</p>
            <p className="text-xs text-ink2">Turn off to close preorders for the current cycle.</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, acceptingOrders: !settings.acceptingOrders })}
            className={`w-12 h-7 rounded-full relative transition-colors ${settings.acceptingOrders ? "bg-forest" : "bg-line"}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${settings.acceptingOrders ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <Field label="Next Preorder Date">
          <input
            className="tb-input"
            type="date"
            value={settings.nextPreorderDate || ""}
            onChange={set("nextPreorderDate")}
          />
          <p className="text-xs text-ink2 mt-1">
            {settings.nextPreorderDate
              ? `Shown to customers as: ${formatWeekdayDate(settings.nextPreorderDate)}`
              : "Not set — the site will use generic \"ready soon\" wording until you set a date."}
            {" "}Update this each time you open a new preorder cycle — it doesn&apos;t have to be the same day every time.
          </p>
        </Field>

        <Field label="Business Name"><input className="tb-input" value={settings.businessName} onChange={set("businessName")} /></Field>
        <Field label="Bank Name"><input className="tb-input" value={settings.bankName} onChange={set("bankName")} /></Field>
        <Field label="Account Name"><input className="tb-input" value={settings.accountName} onChange={set("accountName")} /></Field>
        <Field label="Account Number"><input className="tb-input" value={settings.accountNumber} onChange={set("accountNumber")} /></Field>
        <Field label="WhatsApp Number (with country code, no +)"><input className="tb-input" value={settings.whatsappNumber} onChange={set("whatsappNumber")} /></Field>
        <Field label="Fulfillment Message">
          <textarea className="tb-input resize-none" rows={2} value={settings.fulfillmentMessage} onChange={set("fulfillmentMessage")} />
          <p className="text-xs text-ink2 mt-1">Shown to customers alongside their order status, in addition to the date above.</p>
        </Field>
        <Field label="Maximum Orders (optional)">
          <input className="tb-input" type="number" value={settings.maximumOrders || ""} onChange={(e) => setSettings({ ...settings, maximumOrders: e.target.value ? Number(e.target.value) : null })} />
        </Field>
        <Field label="Optional Reopening Date/Time">
          <input className="tb-input" type="datetime-local" value={settings.cutoffAt || ""} onChange={set("cutoffAt")} />
        </Field>

        <button onClick={save} disabled={saving} className="w-full rounded-full bg-oxblood text-white font-semibold py-3 shadow-pop disabled:opacity-60">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
