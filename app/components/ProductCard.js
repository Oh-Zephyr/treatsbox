"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { formatNaira } from "@/lib/format";
import FoodIcon from "./FoodIcon";
import QtyStepper from "./QtyStepper";
import Reaction from "./Reaction";

export default function ProductCard({ product }) {
  const { getQuantity, increment, decrement } = useCart();
  const [reacting, setReacting] = useState(false);
  const qty = getQuantity("product", product.id);

  const handleIncrement = () => {
    increment("product", product.id);
    setReacting(true);
    setTimeout(() => setReacting(false), 950);
  };

  return (
    <div
      className={`relative bg-white rounded-xl2 shadow-card p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-pop hover:-translate-y-0.5 ${
        qty > 0 ? "ring-1 ring-marigold" : ""
      }`}
    >
      <Reaction show={reacting} />
      <FoodIcon name={product.image} className="w-12 h-12 shrink-0" tone="paper2" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-sm">{product.name}</p>
        <p className="text-xs text-ink2 mt-0.5">{formatNaira(product.price)}</p>
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
