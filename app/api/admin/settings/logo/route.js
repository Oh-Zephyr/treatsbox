import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { uploadBrandingFile, storageConfigured } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 4 * 1024 * 1024; // 4MB, matches the branding bucket's own limit

function extFromType(type) {
  switch (type) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/svg+xml": return "svg";
    default: return "bin";
  }
}

// Admin uploads a real logo file, which gets a public URL saved directly
// into settings.logoUrl -- no need to host the image elsewhere and paste a
// link (that was the previous, less usable version of this feature).
export async function POST(req) {
  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Logo upload isn't available right now (storage isn't configured)." },
      { status: 503 }
    );
  }

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Something went wrong reading your upload. Please try again." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Please choose a logo image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, WEBP, or SVG image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That file is too large (max 4MB)." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Fixed filename per extension (not timestamped) so re-uploading a logo
    // reuses the same URL rather than accumulating old versions forever.
    const path = `logo.${extFromType(file.type)}`;
    const publicUrl = await uploadBrandingFile(path, buffer, file.type);

    const db = await getDb();
    // Cache-bust: Supabase's public URL is stable, so an <img> pointing at
    // it may keep showing a browser-cached old version after a re-upload.
    db.data.settings.logoUrl = `${publicUrl}?v=${Date.now()}`;
    await db.write();

    return NextResponse.json({ settings: db.data.settings });
  } catch (err) {
    console.error("Logo upload failed:", err);
    return NextResponse.json({ error: "Something went wrong uploading your logo. Please try again." }, { status: 500 });
  }
}
