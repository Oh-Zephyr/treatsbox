"use client";

import { useCart } from "./CartContext";
import { useToast } from "./Toast";
import { formatNaira } from "@/lib/format";
import FoodVisual from "./FoodVisual";
import QtyStepper from "./QtyStepper";
import Reaction from "./Reaction";
import { useState } from "react";

export default function PackageCard({ pkg, index = 0 }) {
  const { getQuantity, increment, decrement, setQuantity } = useCart();
  const showToast = useToast();
  const [reacting, setReacting] = useState(false);
  const qty = getQuantity("package", pkg.id);

  const handleAdd = () => {
    setQuantity("package", pkg.id, qty === 0 ? 1 : qty + 1);
    showToast(`${pkg.name} added to your order`);
    setReacting(true);
    setTimeout(() => setReacting(false), 850);
  };

  const contentsLine = pkg.contents.map((c) => `${c.quantity} ${c.label}`).join(" · ");

  return (
    <div className="group relative">
      <div className="relative overflow-hidden">
        <FoodVisual
          imageUrl={pkg.imageUrl}
          iconName={pkg.image}
          alt={pkg.name}
          variant="card"
          shapeIndex={index}
          className="w-full aspect-[5/4] transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <Reaction show={reacting} />
      </div>

      <div className="pt-4 px-1">
        <p className="eyebrow">{pkg.name.replace(/^Regular\s+/i, "")}</p>
        <div className="flex items-start justify-between gap-3 mt-0.5">
          <h3 className="font-display text-xl font-semibold text-ink leading-snug">{pkg.name}</h3>
          <p className="font-display text-lg font-semibold text-ink shrink-0 tabular-nums">{formatNaira(pkg.price)}</p>
        </div>
        <p className="text-sm text-ink2 mt-1.5 leading-relaxed">{contentsLine}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          {qty > 0 ? (
            <QtyStepper value={qty} onIncrement={() => increment("package", pkg.id)} onDecrement={() => decrement("package", pkg.id)} />
          ) : (
            <span />
          )}
          <button
            onClick={handleAdd}
            className="rounded-full bg-gradient-to-r from-oxblood to-oxblood2 text-paper text-sm font-semibold px-5 py-2.5 shadow-glow hover:shadow-glowGold active:scale-95 transition-all"
          >
            {qty > 0 ? "Add Another" : "Add to Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
