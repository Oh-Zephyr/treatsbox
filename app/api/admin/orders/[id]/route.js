import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ORDER_TRANSITIONS = {
  "mark-ready": "Ready for Collection",
  "mark-completed": "Completed",
  "cancel-order": "Cancelled"
};

export async function GET(req, { params }) {
  const { id } = await params;
  const db = await getDb();
  const order = db.data.orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const db = await getDb();
  const order = db.data.orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const { action } = body || {};

  if (action === "confirm-payment") {
    order.paymentStatus = "Confirmed";
  } else if (action === "reject-payment") {
    order.paymentStatus = "Rejected";
  } else if (ORDER_TRANSITIONS[action]) {
    order.orderStatus = ORDER_TRANSITIONS[action];
  } else {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  order.updatedAt = new Date().toISOString();
  await db.write();
  return NextResponse.json({ order });
}
