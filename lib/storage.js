// File storage, backed by Supabase Storage. Uses the service-role key
// server-side only (never sent to the browser) so it bypasses Row Level
// Security entirely -- no storage policies needed, since uploads only ever
// happen from our own API routes, never directly from the client.
//
// Two buckets, different visibility on purpose:
//   - "receipts" (private): payment receipts can show bank transfer
//     details, so they're never reachable by a guessable URL. Admin views
//     them through short-lived signed URLs generated on demand.
//   - "branding" (public): a logo needs to be visible to every site
//     visitor, so it gets a normal permanent public URL -- no signing.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

export function storageConfigured() {
  return !!(SUPABASE_URL && SERVICE_ROLE_KEY);
}

async function uploadToBucket(bucket, path, buffer, contentType) {
  if (!storageConfigured()) {
    throw new Error("Storage is not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
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
    throw new Error(`Upload to ${bucket} failed (${res.status}): ${text}`);
  }
  return path;
}

export async function uploadReceipt(path, buffer, contentType) {
  return uploadToBucket("receipts", path, buffer, contentType);
}

// Signed URL valid for a short window -- generated fresh each time an admin
// views an order, never stored, so a leaked link expires quickly.
export async function getReceiptSignedUrl(path, expiresInSeconds = 3600) {
  if (!storageConfigured() || !path) return null;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/receipts/${path}`, {
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

// Branding assets (logo) go in a public bucket -- a normal permanent URL,
// no signing needed, since these are meant to be visible to everyone.
export async function uploadBrandingFile(path, buffer, contentType) {
  await uploadToBucket("branding", path, buffer, contentType);
  return `${SUPABASE_URL}/storage/v1/object/public/branding/${path}`;
}
