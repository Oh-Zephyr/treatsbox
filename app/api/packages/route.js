import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const packages = db.data.packages.filter((p) => p.active);
  return NextResponse.json({ packages });
}
