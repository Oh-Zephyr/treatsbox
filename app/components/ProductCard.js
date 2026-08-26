"use client";

import { useCart } from "./CartContext";
import { formatNaira } from "@/lib/format";
import FoodIcon from "./FoodIcon";
import QtyStepper from "./QtyStepper";

export default function ProductCard({ product }) {
  const { getQuantity, increment, decrement } = useCart();
  const qty = getQuantity("product", product.id);

  return (
    <div className={`bg-white rounded-xl2 shadow-card p-4 flex items-center gap-3 transition-shadow ${qty > 0 ? "ring-1 ring-marigold" : ""}`}>
      <FoodIcon name={product.image} className="w-12 h-12 shrink-0" tone="paper2" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-sm">{product.name}</p>
        <p className="text-xs text-ink2 mt-0.5">{formatNaira(product.price)}</p>
      </div>
      <QtyStepper
        size="sm"
        value={qty}
        onIncrement={() => increment("product", product.id)}
        onDecrement={() => decrement("product", product.id)}
      />
    </div>
  );
}
