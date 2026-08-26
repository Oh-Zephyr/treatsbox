import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const db = await getDb();
  const pkg = db.data.packages.find((p) => p.id === id);
  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });

  const fields = ["name", "description", "price", "image", "imageUrl", "active", "contents"];
  for (const f of fields) {
    if (body[f] !== undefined) pkg[f] = body[f];
  }
  await db.write();
  return NextResponse.json({ package: pkg });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const db = await getDb();
  const pkg = db.data.packages.find((p) => p.id === id);
  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });
  pkg.active = false;
  await db.write();
  return NextResponse.json({ ok: true });
}
