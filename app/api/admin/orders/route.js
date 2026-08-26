import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req) {
  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const orderStatus = searchParams.get("orderStatus") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const receiptStatus = searchParams.get("receiptStatus") || "";

  let orders = [...db.data.orders];

  if (q) {
    orders = orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q)
    );
  }
  if (orderStatus) orders = orders.filter((o) => o.orderStatus === orderStatus);
  if (paymentStatus) orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  if (receiptStatus) orders = orders.filter((o) => o.receiptStatus === receiptStatus);

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json({ orders });
}
