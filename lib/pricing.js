// Pure pricing logic — safe to import from both client and server code.
export function computeOrderTotals(items, products, packages) {
  let subtotal = 0;
  let packagingTotal = 0;
  const lineItems = [];

  for (const raw of items) {
    if (raw.itemType === "package") {
      const pkg = packages.find((p) => p.id === raw.refId);
      if (!pkg || !pkg.active) continue;
      const qty = Math.max(1, Number(raw.quantity) || 0);
      const total = pkg.price * qty;
      subtotal += total;
      lineItems.push({
        itemType: "package",
        refId: pkg.id,
        itemName: pkg.name,
        quantity: qty,
        unitPrice: pkg.price,
        total,
      });
    } else {
      const prod = products.find((p) => p.id === raw.refId);
      if (!prod || !prod.active) continue;
      const qty = Math.max(1, Number(raw.quantity) || 0);
      const total = prod.price * qty;
      const isPackaging = /packaging/i.test(prod.name);
      if (isPackaging) {
        packagingTotal += total;
      } else {
        subtotal += total;
      }
      lineItems.push({
        itemType: "product",
        refId: prod.id,
        itemName: prod.name,
        quantity: qty,
        unitPrice: prod.price,
        total,
        isPackaging,
      });
    }
  }

  const grandTotal = subtotal + packagingTotal;
  return { lineItems, subtotal, packagingTotal, grandTotal };
}
