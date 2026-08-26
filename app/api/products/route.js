import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const products = db.data.products
    .filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json({ products });
}
