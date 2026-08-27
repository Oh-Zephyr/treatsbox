import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { computeOrderTotals, nextOrderNumber, nextQueuePosition, newOrderId } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatNaira } from "@/lib/format";
import { uploadReceipt, storageConfigured } from "@/lib/storage";

const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
const MAX_RECEIPT_BYTES = 8 * 1024 * 1024; // 8MB, matches the storage bucket's own limit

function extFromType(type) {
  switch (type) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/heic": return "heic";
    case "application/pdf": return "pdf";
    default: return "bin";
  }
}

// Order creation requires the payment receipt to already be attached --
// there is no "order first, receipt later" state. Accepts multipart form
// data (not JSON) because a file is now a required part of the request:
// fields "customer" (JSON string), "items" (JSON string), "idempotencyKey"
// (string, optional), and "file" (the receipt, required).
export async function POST(req) {
  if (!storageConfigured()) {
    // A genuine system outage, not a customer choice not to upload --
    // still refuse to queue an order without a receipt (that's the whole
    // point of this rule), but be honest that it's our side that's broken.
    return NextResponse.json(
      { error: "Receipt upload isn't available right now, so we can't complete your order. Please try again shortly, or contact us on WhatsApp." },
      { status: 503 }
    );
  }

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Something went wrong while submitting your order. Please try again." }, { status: 400 });
  }

  let customer, items;
  try {
    customer = JSON.parse(formData.get("customer") || "null");
    items = JSON.parse(formData.get("items") || "null");
  } catch {
    return NextResponse.json({ error: "Something went wrong while submitting your order. Please try again." }, { status: 400 });
  }
  const idempotencyKey = formData.get("idempotencyKey") || null;

  if (!customer || !customer.name || !customer.phone || !customer.whatsapp || !customer.email) {
    return NextResponse.json({ error: "Please fill in all required details before continuing." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your order is empty. Please add a package or some treats first." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Please upload your payment receipt to complete your order." }, { status: 400 });
  }
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Please upload a photo (JPG, PNG, WEBP, HEIC) or a PDF of your receipt." }, { status: 400 });
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return NextResponse.json({ error: "That file is too large (max 8MB). Please use a smaller photo." }, { status: 400 });
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

    // Reserve the order number now (mutates db.data.settings.orderCounter
    // in place, not yet written) so the receipt file path can use it.
    const orderNumber = nextOrderNumber(db);
    const queuePosition = nextQueuePosition(db);

    // Upload the receipt before creating/saving the order. If this throws,
    // nothing has been written yet (db.write() hasn't been called), so the
    // reserved order number is simply discarded rather than leaving a gap
    // -- no order exists without a receipt, by construction.
    const buffer = Buffer.from(await file.arrayBuffer());
    const receiptPath = `${orderNumber}/${Date.now()}.${extFromType(file.type)}`;
    await uploadReceipt(receiptPath, buffer, file.type);

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
      // Receipt is already attached at creation, so there's no "Not
      // Verified, please send a receipt" interstitial state anymore --
      // every order starts already awaiting admin confirmation.
      paymentStatus: "Awaiting Confirmation",
      receiptStatus: "Submitted",
      receiptPath,
      queuePosition,
      collectionDate: s.nextPreorderDate || null,
      fulfillmentMessage: s.fulfillmentMessage || "",
      createdAt: now,
      updatedAt: now
    };

    db.data.orders.push(order);
    await db.write();

    try {
      await sendOrderConfirmationEmail(order, formatNaira);
    } catch (err) {
      console.error("Order confirmation email threw unexpectedly:", err);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your order. Please try again, or contact us on WhatsApp if it keeps happening." },
      { status: 500 }
    );
  }
}
