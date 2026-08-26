import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";

// Public-safe subset of settings for the storefront.
export async function GET() {
  const db = await getDb();
  const s = db.data.settings;
  const activeOrders = db.data.orders.filter(
    (o) => o.orderStatus === "Queued" || o.orderStatus === "Ready for Collection"
  ).length;
  const capacityReached = !!(s.maximumOrders && activeOrders >= s.maximumOrders);

  return NextResponse.json({
    businessName: s.businessName,
    whatsappNumber: s.whatsappNumber,
    fulfillmentMessage: s.fulfillmentMessage,
    acceptingOrders: s.acceptingOrders && !capacityReached,
    cutoffAt: s.cutoffAt,
    bankName: s.bankName,
    accountName: s.accountName,
    accountNumber: s.accountNumber
  });
}
