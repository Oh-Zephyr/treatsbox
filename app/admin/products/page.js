"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format";
import FoodIcon from "../../components/FoodIcon";

const ICON_OPTIONS = ["samosa", "springroll", "puffpuff", "beef", "chicken", "pouch", "box", "food"];
const EMPTY = { name: "", description: "", price: "", image: "food", imageUrl: "", active: true, sortOrder: "", maxQty: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  const startNew = () => { setEditing("new"); setForm(EMPTY); };
  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ ...p, price: String(p.price), sortOrder: String(p.sortOrder), maxQty: p.maxQty ? String(p.maxQty) : "" });
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image: form.image,
      imageUrl: form.imageUrl?.trim() || null,
      active: form.active,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
      maxQty: form.maxQty ? Number(form.maxQty) : null,
    };
    try {
      if (editing === "new") {
        const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (res.ok) setProducts((prev) => [...prev, data.product].sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        const res = await fetch(`/api/admin/products/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (res.ok) setProducts((prev) => prev.map((p) => (p.id === editing ? data.product : p)).sort((a, b) => a.sortOrder - b.sortOrder));
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p) => {
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !p.active }) });
    const data = await res.json();
    if (res.ok) setProducts((prev) => prev.map((x) => (x.id === p.id ? data.product : x)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        <button onClick={startNew} className="rounded-full bg-oxblood text-white text-sm font-semibold px-4 py-2.5">Add Product</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl2 shadow-card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-paper2" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-paper2 rounded w-2/3" />
                  <div className="h-3 bg-paper2 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        {!loading &&
          products.map((p) => (
          <div key={p.id} className={`bg-white rounded-xl2 shadow-card p-4 ${!p.active ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-3">
              <FoodIcon name={p.image} className="w-11 h-11 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm truncate">{p.name}</p>
                <p className="text-xs text-ink2">{formatNaira(p.price)}</p>
              </div>
            </div>
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
          <div className="relative bg-white rounded-xl2 shadow-pop p-6 w-full max-w-sm space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg text-ink">{editing === "new" ? "Add Product" : "Edit Product"}</h3>
            <input className="tb-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="tb-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="tb-input" placeholder="Price (₦)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="tb-input" placeholder="Max quantity per order (optional)" type="number" value={form.maxQty} onChange={(e) => setForm({ ...form, maxQty: e.target.value })} />
            <input className="tb-input" placeholder="Display order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            <div>
              <input className="tb-input" placeholder="Photo URL (optional — leave blank to use icon)" value={form.imageUrl || ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <p className="text-xs text-ink2 mt-1">Paste a link to a hosted photo. Without one, the icon below is shown instead.</p>
            </div>
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
