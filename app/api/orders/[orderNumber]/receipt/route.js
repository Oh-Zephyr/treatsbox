import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { uploadReceipt, storageConfigured } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB, matches the storage bucket's own limit

function extFromType(type) {
  switch (type) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/heic": return "heic";
    case "application/pdf": return "pdf";
    default: return "bin";
  }
}

// Customer uploads their payment receipt (image or PDF) and it's attached
// directly to the order for admin to review -- the in-app alternative to
// sending it over WhatsApp.
export async function POST(req, { params }) {
  const { orderNumber } = await params;

  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Receipt upload isn't available right now. Please send your receipt on WhatsApp instead." },
      { status: 503 }
    );
  }

  const db = await getDb();
  const order = db.data.orders.find((o) => o.orderNumber === orderNumber);
  if (!order) {
    return NextResponse.json({ error: "We couldn't find an order with that number." }, { status: 404 });
  }

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Something went wrong reading your upload. Please try again." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Please choose a file to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Please upload a photo (JPG, PNG, WEBP, HEIC) or a PDF of your receipt." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That file is too large (max 8MB). Please use a smaller photo, or send it on WhatsApp instead." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${orderNumber}/${Date.now()}.${extFromType(file.type)}`;
    await uploadReceipt(path, buffer, file.type);

    order.receiptPath = path;
    order.receiptStatus = "Submitted";
    if (order.paymentStatus === "Not Verified" || order.paymentStatus === "Rejected") {
      order.paymentStatus = "Awaiting Confirmation";
    }
    order.updatedAt = new Date().toISOString();
    await db.write();

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Receipt upload failed:", err);
    return NextResponse.json(
      { error: "Something went wrong uploading your receipt. Please try again, or send it on WhatsApp instead." },
      { status: 500 }
    );
  }
}
