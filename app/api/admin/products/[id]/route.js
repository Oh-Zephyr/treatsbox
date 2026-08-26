import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const db = await getDb();
  const product = db.data.products.find((p) => p.id === id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const fields = ["name", "description", "price", "image", "imageUrl", "active", "sortOrder", "maxQty"];
  for (const f of fields) {
    if (body[f] !== undefined) product[f] = body[f];
  }
  await db.write();
  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const db = await getDb();
  const product = db.data.products.find((p) => p.id === id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  product.active = false;
  await db.write();
  return NextResponse.json({ ok: true });
}
