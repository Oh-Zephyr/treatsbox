"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format";
import FoodIcon from "../../components/FoodIcon";

const ICON_OPTIONS = ["beefpack", "chickenpack", "pack", "food"];
const EMPTY = { name: "", description: "", price: "", image: "pack", active: true, contents: [] };

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/packages").then((r) => r.json()).then((d) => setPackages(d.packages || []));
    fetch("/api/admin/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing("new"); setForm(EMPTY); };
  const startEdit = (p) => { setEditing(p.id); setForm({ ...p, price: String(p.price) }); };

  const addContentRow = () => {
    if (products.length === 0) return;
    setForm({ ...form, contents: [...form.contents, { productId: products[0].id, label: products[0].name, quantity: 1 }] });
  };
  const updateContentRow = (i, patch) => {
    const next = [...form.contents];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, contents: next });
  };
  const removeContentRow = (i) => setForm({ ...form, contents: form.contents.filter((_, idx) => idx !== i) });

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image: form.image,
      active: form.active,
      contents: form.contents,
    };
    if (editing === "new") {
      await fetch("/api/admin/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch(`/api/admin/packages/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    load();
    setSaving(false);
    setEditing(null);
  };

  const toggleActive = async (p) => {
    await fetch(`/api/admin/packages/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !p.active }) });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Packages</h1>
        <button onClick={startNew} className="rounded-full bg-oxblood text-white text-sm font-semibold px-4 py-2.5">Add Package</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {packages.map((p) => (
          <div key={p.id} className={`bg-white rounded-xl2 shadow-card p-4 ${!p.active ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FoodIcon name={p.image} className="w-12 h-12 shrink-0" />
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-ink2">{formatNaira(p.price)}</p>
                </div>
              </div>
            </div>
            <ul className="text-xs text-ink2 mt-2 space-y-0.5">
              {p.contents.map((c, i) => <li key={i}>{c.quantity} {c.label}</li>)}
            </ul>
            <div className="flex gap-2 mt-3">
              <button onClick={() => startEdit(p)} className="text-xs font-semibold text-oxblood">Edit</button>
              <button onClick={() => toggleActive(p)} className="text-xs font-semibold text-ink2">{p.active ? "Deactivate" : "Activate"}</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-xl2 shadow-pop p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg text-ink">{editing === "new" ? "Add Package" : "Edit Package"}</h3>
            <input className="tb-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="tb-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="tb-input" placeholder="Price (₦)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />

            <div>
              <span className="text-xs font-semibold text-ink2 block mb-1.5">Icon</span>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button key={icon} onClick={() => setForm({ ...form, image: icon })} className={`rounded-full ${form.image === icon ? "ring-2 ring-oxblood" : ""}`}>
                    <FoodIcon name={icon} className="w-9 h-9" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-ink2">Contents</span>
                <button onClick={addContentRow} className="text-xs font-semibold text-oxblood">+ Add item</button>
              </div>
              <div className="space-y-2">
                {form.contents.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      className="tb-input flex-1"
                      value={c.productId}
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        updateContentRow(i, { productId: e.target.value, label: prod?.name || c.label });
                      }}
                    >
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input
                      type="number"
                      className="tb-input w-16"
                      value={c.quantity}
                      onChange={(e) => updateContentRow(i, { quantity: Number(e.target.value) })}
                    />
                    <button onClick={() => removeContentRow(i)} className="text-alert text-lg leading-none px-1">×</button>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink2">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-semibold text-ink">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.price} className="flex-1 rounded-full bg-oxblood text-white py-2.5 text-sm font-semibold disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
