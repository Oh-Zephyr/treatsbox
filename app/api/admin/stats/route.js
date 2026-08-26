import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const orders = db.data.orders;

  const totalOrders = orders.length;
  const pendingVerification = orders.filter((o) => o.paymentStatus === "Not Verified").length;
  const awaitingConfirmation = orders.filter((o) => o.paymentStatus === "Awaiting Confirmation").length;
  const confirmedPayments = orders.filter((o) => o.paymentStatus === "Confirmed").length;
  const queuedOrders = orders.filter((o) => o.orderStatus === "Queued").length;
  const readyOrders = orders.filter((o) => o.orderStatus === "Ready for Collection").length;
  const completedOrders = orders.filter((o) => o.orderStatus === "Completed").length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "Confirmed")
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const ordersThisWeek = orders.filter((o) => new Date(o.createdAt).getTime() >= weekAgo).length;

  const nonCancelled = orders.filter((o) => o.orderStatus !== "Cancelled");
  const averageOrderValue = nonCancelled.length
    ? Math.round(nonCancelled.reduce((s, o) => s + o.grandTotal, 0) / nonCancelled.length)
    : 0;

  const productCounts = {};
  const packageCounts = {};
  for (const o of nonCancelled) {
    for (const item of o.items) {
      if (item.itemType === "product") {
        productCounts[item.itemName] = (productCounts[item.itemName] || 0) + item.quantity;
      } else {
        packageCounts[item.itemName] = (packageCounts[item.itemName] || 0) + item.quantity;
      }
    }
  }
  const mostOrderedProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));
  const mostPopularPackages = Object.entries(packageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  return NextResponse.json({
    totalOrders, pendingVerification, awaitingConfirmation, confirmedPayments,
    queuedOrders, readyOrders, completedOrders, totalRevenue,
    ordersThisWeek, averageOrderValue, mostOrderedProducts, mostPopularPackages
  });
}
