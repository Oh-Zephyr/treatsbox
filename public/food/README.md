# Adding real Treatsbox food photography

No real photos exist yet, so the app currently shows an illustrated
placeholder (`app/components/FoodVisual.js`) for every product and package.
This folder is where real photos go once they exist.

## To add a photo

1. Get a photo shot consistently with the others (same lighting, background,
   framing — see the visual-identity brief for the specific style
   direction). Export as JPEG or WebP, reasonably sized (~1600px on the
   long edge is plenty; the app compresses further and generates
   responsive/WebP/AVIF variants automatically via `next/image`).
2. Drop the file in this folder, e.g. `public/food/regular-beef-pack.webp`.
3. In the admin (`/admin/products` or `/admin/packages`), edit that item and
   set **Photo URL** to `/food/regular-beef-pack.webp`. It replaces the
   placeholder immediately — no code changes or redeploy needed.

Photo URLs don't have to live in this folder — any hosted HTTPS image URL
works (the admin field accepts any URL) — but keeping the business's own
photos here means they ship with the app and don't depend on an external
host staying up.

## Suggested naming (matching the product/package icon keys already in use)

```
samosa.webp
spring-roll.webp
puff-puff.webp
beef.webp
chicken.webp
packaging-pouch.webp
packaging-box.webp
regular-beef-pack.webp
regular-chicken-pack.webp
```
