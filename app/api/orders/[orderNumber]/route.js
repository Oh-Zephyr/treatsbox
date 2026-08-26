import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Public lookup + the one customer-triggerable transition: "I've Sent My Receipt".
export async function GET(req, { params }) {
  const { orderNumber } = await params;
  const db = await getDb();
  const order = db.data.orders.find((o) => o.orderNumber === orderNumber);
  if (!order) {
    return NextResponse.json({ error: "We couldn't find an order with that number." }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(req, { params }) {
  const { orderNumber } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const db = await getDb();
  const order = db.data.orders.find((o) => o.orderNumber === orderNumber);
  if (!order) {
    return NextResponse.json({ error: "We couldn't find an order with that number." }, { status: 404 });
  }

  if (body.action === "sent-receipt") {
    order.receiptStatus = "Submitted";
    if (order.paymentStatus === "Not Verified") {
      order.paymentStatus = "Awaiting Confirmation";
    }
    order.updatedAt = new Date().toISOString();
    await db.write();
    return NextResponse.json({ order });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
