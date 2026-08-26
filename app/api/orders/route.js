import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { computeOrderTotals, nextOrderNumber, nextQueuePosition, newOrderId } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatNaira } from "@/lib/format";

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
        { error: "Treatsbox preorders are closed right now. Please check back for the next preorder window." },
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

    const orderNumber = nextOrderNumber(db);
    const queuePosition = nextQueuePosition(db);
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
      // Snapshot the collection date and fulfillment message that were
      // promised at the moment this order was placed. Admin can update
      // nextPreorderDate for the following cycle without silently changing
      // what an already-placed order says.
      collectionDate: s.nextPreorderDate || null,
      fulfillmentMessage: s.fulfillmentMessage || "",
      createdAt: now,
      updatedAt: now
    };

    db.data.orders.push(order);
    await db.write();

    // Best-effort: the order is already saved and queued regardless of
    // whether this succeeds. Never let an email failure affect the order
    // response -- caught and logged, not thrown, so a Resend outage or
    // misconfiguration can't turn a successful order into a failed request.
    try {
      await sendOrderConfirmationEmail(order, formatNaira);
    } catch (err) {
      console.error("Order confirmation email threw unexpectedly:", err);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    // Surface a real message + server-side log instead of a bare 500, so a
    // storage failure (e.g. a read-only filesystem or database issue) is
    // diagnosable from server logs instead of just "something went wrong"
    // with no trace.
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your order. Please try again, or contact us on WhatsApp if it keeps happening." },
      { status: 500 }
    );
  }
}
