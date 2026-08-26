import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { getReceiptSignedUrl } from "@/lib/storage";

// Admin views the receipt via a signed URL generated fresh on each request
// (never stored), so a leaked link expires quickly rather than granting
// permanent access to what may show a customer's bank transfer details.
export async function GET(req, { params }) {
  const { id } = await params;
  const db = await getDb();
  const order = db.data.orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (!order.receiptPath) return NextResponse.json({ error: "No receipt uploaded for this order." }, { status: 404 });

  const url = await getReceiptSignedUrl(order.receiptPath);
  if (!url) return NextResponse.json({ error: "Couldn't generate a link to the receipt right now." }, { status: 500 });

  return NextResponse.json({ url });
}
