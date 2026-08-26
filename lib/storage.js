// Receipt file storage, backed by Supabase Storage. Uses the service-role
// key server-side only (never sent to the browser) so it bypasses Row
// Level Security entirely -- no storage policies needed, since uploads and
// signed-URL generation only ever happen from our own API routes, never
// directly from the client.
//
// The bucket is private (see the receipts bucket created via migration):
// receipt images can contain bank transfer details, so they should never
// be reachable by a guessable public URL. Admin views them via short-lived
// signed URLs generated on demand instead.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const BUCKET = "receipts";

export function storageConfigured() {
  return !!(SUPABASE_URL && SERVICE_ROLE_KEY);
}

export async function uploadReceipt(path, buffer, contentType) {
  if (!storageConfigured()) {
    throw new Error("Receipt storage is not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": contentType,
      "x-upsert": "true"
    },
    body: buffer
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Receipt upload failed (${res.status}): ${text}`);
  }
  return path;
}

// Signed URL valid for a short window -- generated fresh each time an admin
// views an order, never stored, so a leaked link expires quickly.
export async function getReceiptSignedUrl(path, expiresInSeconds = 3600) {
  if (!storageConfigured() || !path) return null;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ expiresIn: expiresInSeconds })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.signedURL ? `${SUPABASE_URL}/storage/v1${data.signedURL}` : null;
}
