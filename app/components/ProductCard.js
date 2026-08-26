"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { formatNaira } from "@/lib/format";
import FoodVisual from "./FoodVisual";
import QtyStepper from "./QtyStepper";
import Reaction from "./Reaction";

export default function ProductCard({ product }) {
  const { getQuantity, increment, decrement } = useCart();
  const [reacting, setReacting] = useState(false);
  const qty = getQuantity("product", product.id);

  const handleIncrement = () => {
    increment("product", product.id);
    setReacting(true);
    setTimeout(() => setReacting(false), 850);
  };

  return (
    <div
      className={`relative flex items-center gap-4 py-3 border-b border-line transition-colors ${
        qty > 0 ? "bg-marigold/5" : ""
      }`}
    >
      <Reaction show={reacting} />
      <FoodVisual imageUrl={product.imageUrl} iconName={product.image} alt={product.name} variant="row" className="w-16 h-16 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-sm">{product.name}</p>
        <p className="text-xs text-ink2 mt-0.5 tabular-nums">{formatNaira(product.price)}</p>
      </div>
      <QtyStepper
        size="sm"
        value={qty}
        onIncrement={handleIncrement}
        onDecrement={() => decrement("product", product.id)}
      />
    </div>
  );
}
