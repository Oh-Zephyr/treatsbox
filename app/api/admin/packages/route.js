import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET() {
  const db = await getDb();
  return NextResponse.json({ packages: db.data.packages });
}

export async function POST(req) {
  const body = await req.json();
  if (!body.name || body.price == null) {
    return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
  }
  const db = await getDb();
  const pkg = {
    id: "pkg_" + nanoid(8),
    name: body.name,
    description: body.description || "",
    price: Number(body.price),
    image: body.image || "pack",
    imageUrl: body.imageUrl || null,
    active: body.active !== false,
    contents: Array.isArray(body.contents) ? body.contents : []
  };
  db.data.packages.push(pkg);
  await db.write();
  return NextResponse.json({ package: pkg }, { status: 201 });
}
