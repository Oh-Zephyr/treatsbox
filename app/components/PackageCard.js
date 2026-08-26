"use client";

import { useCart } from "./CartContext";
import { useToast } from "./Toast";
import { formatNaira } from "@/lib/format";
import FoodIcon from "./FoodIcon";
import QtyStepper from "./QtyStepper";
import Reaction from "./Reaction";
import { useState } from "react";

export default function PackageCard({ pkg }) {
  const { getQuantity, increment, decrement, setQuantity } = useCart();
  const showToast = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const [reacting, setReacting] = useState(false);
  const qty = getQuantity("package", pkg.id);

  const handleAdd = () => {
    setQuantity("package", pkg.id, qty === 0 ? 1 : qty + 1);
    showToast(`${pkg.name} added to your order`);
    setJustAdded(true);
    setReacting(true);
    setTimeout(() => setJustAdded(false), 400);
    setTimeout(() => setReacting(false), 950);
  };

  return (
    <div className="group relative bg-white rounded-xl2 shadow-card overflow-hidden transition-all duration-300 hover:shadow-pop hover:-translate-y-1">
      <div className="foil-edge" />
      <div className="p-5 flex flex-col relative">
        <Reaction show={reacting} />
        <div className="flex items-start justify-between gap-3">
          <FoodIcon
            name={pkg.image}
            className={`w-16 h-16 shrink-0 transition-transform duration-300 group-hover:scale-105 ${justAdded ? "animate-pop-in" : ""}`}
          />
          <p className="font-display text-xl font-semibold text-oxblood tabular-nums">{formatNaira(pkg.price)}</p>
        </div>
        <h3 className="font-display text-lg font-semibold text-ink mt-3">{pkg.name}</h3>
        {pkg.description && <p className="text-sm text-ink2 mt-0.5">{pkg.description}</p>}
        <ul className="mt-3 space-y-1 text-sm text-ink2">
          {pkg.contents.map((c, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-marigold2 shrink-0" />
              {c.quantity} {c.label}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-3">
          {qty > 0 ? (
            <QtyStepper value={qty} onIncrement={() => increment("package", pkg.id)} onDecrement={() => decrement("package", pkg.id)} />
          ) : (
            <span className="text-xs text-ink2/70 italic font-display">Not yet added</span>
          )}
          <button
            onClick={handleAdd}
            className="rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-white text-sm font-semibold px-4 py-2.5 shadow-glow hover:brightness-105 active:scale-95 transition-all"
          >
            {qty > 0 ? "Add Another" : "Add to Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
