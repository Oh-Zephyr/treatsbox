import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  return NextResponse.json({ settings: db.data.settings });
}

export async function PATCH(req) {
  const body = await req.json();
  const db = await getDb();
  const s = db.data.settings;
  const fields = [
    "businessName", "bankName", "accountName", "accountNumber", "whatsappNumber",
    "fulfillmentMessage", "nextPreorderDate", "acceptingOrders", "maximumOrders", "cutoffAt"
  ];
  for (const f of fields) {
    if (body[f] !== undefined) s[f] = body[f];
  }
  await db.write();
  return NextResponse.json({ settings: s });
}
