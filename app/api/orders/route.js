import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { computeOrderTotals, nextOrderNumber, nextQueuePosition, newOrderId } from "@/lib/orders";

// Customer creates an order the moment they click "I Have Paid".
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Something went wrong while submitting your order. Please try again." }, { status: 400 });
  }

  const { customer, items, idempotencyKey } = body || {};

  if (!customer || !customer.name || !customer.phone || !customer.whatsapp || !customer.email) {
    return NextResponse.json({ error: "Please fill in all required details before continuing." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your order is empty. Please add a package or some treats first." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const s = db.data.settings;

    // Duplicate submission protection.
    if (idempotencyKey) {
      const existing = db.data.orders.find((o) => o.idempotencyKey === idempotencyKey);
      if (existing) {
        return NextResponse.json({ order: existing }, { status: 200 });
      }
    }

    const activeOrders = db.data.orders.filter(
      (o) => o.orderStatus === "Queued" || o.orderStatus === "Ready for Collection"
    ).length;
    const capacityReached = !!(s.maximumOrders && activeOrders >= s.maximumOrders);

    if (!s.acceptingOrders || capacityReached) {
      return NextResponse.json(
        { error: "Treatsbox preorders are closed for this Sunday. Please check back for the next preorder window." },
        { status: 409 }
      );
    }

    const { lineItems, subtotal, packagingTotal, grandTotal } = computeOrderTotals(
      items,
      db.data.products,
      db.data.packages
    );

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "Your order is empty. Please add a package or some treats first." }, { status: 400 });
    }

    const orderNumber = await nextOrderNumber();
    const queuePosition = await nextQueuePosition();
    const now = new Date().toISOString();

    const order = {
      id: newOrderId(),
      orderNumber,
      idempotencyKey: idempotencyKey || null,
      customerName: customer.name,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      email: customer.email,
      notes: customer.notes || "",
      items: lineItems,
      subtotal,
      packagingTotal,
      grandTotal,
      orderStatus: "Queued",
      paymentStatus: "Not Verified",
      receiptStatus: "Not Submitted",
      queuePosition,
      createdAt: now,
      updatedAt: now
    };

    db.data.orders.push(order);
    await db.write();

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    // Surface a real message + server-side log instead of a bare 500, so a
    // storage failure (e.g. a read-only filesystem on some hosts) is
    // diagnosable instead of just "something went wrong" with no trace.
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your order. Please try again, or contact us on WhatsApp if it keeps happening." },
      { status: 500 }
    );
  }
}
