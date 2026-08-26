/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product/package photo URLs are set by the authenticated admin (see
    // FoodVisual.js), not arbitrary end-user input, so a broad allow-list is
    // an acceptable tradeoff here in exchange for automatic WebP/AVIF
    // conversion, responsive sizing, and lazy loading on real photography
    // once it's added — see the brief's performance requirements.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
