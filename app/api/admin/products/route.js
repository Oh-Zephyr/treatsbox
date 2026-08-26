import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET() {
  const db = await getDb();
  const products = [...db.data.products].sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json({ products });
}

export async function POST(req) {
  const body = await req.json();
  if (!body.name || body.price == null) {
    return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
  }
  const db = await getDb();
  const product = {
    id: "p_" + nanoid(8),
    name: body.name,
    description: body.description || "",
    price: Number(body.price),
    image: body.image || "food",
    active: body.active !== false,
    sortOrder: body.sortOrder != null ? Number(body.sortOrder) : db.data.products.length + 1,
    maxQty: body.maxQty ? Number(body.maxQty) : null
  };
  db.data.products.push(product);
  await db.write();
  return NextResponse.json({ product }, { status: 201 });
}
