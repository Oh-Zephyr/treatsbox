/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm champagne base
        paper: "#FBF1E9",
        paper2: "#F6E1DA",
        // Deep aubergine ink, for an editorial/fashion feel rather than flat black
        ink: "#2B1526",
        ink2: "#74576A",
        // Champagne gold — premium accents, icons, badges
        marigold: "#D8A84E",
        marigold2: "#B98738",
        // Raspberry rose — the brand's signature accent color
        oxblood: "#C13868",
        oxblood2: "#9A2650",
        // Soft sage for positive states
        forest: "#5C7C63",
        // Cranberry for alerts — stays in the rose family so it never clashes
        alert: "#B23350",
        line: "#EEDCD1",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,21,38,0.05), 0 10px 30px -10px rgba(43,21,38,0.16)",
        pop: "0 8px 24px -4px rgba(43,21,38,0.28)",
        glow: "0 6px 20px -4px rgba(193,56,104,0.45)",
        glowGold: "0 6px 20px -4px rgba(216,168,78,0.5)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-in": {
          "0%": { transform: "translateY(8px) scale(0.98)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "float-up-fade": {
          "0%": { transform: "translateY(0) scale(0.8)", opacity: "0" },
          "25%": { opacity: "1" },
          "100%": { transform: "translateY(-38px) scale(1.1)", opacity: "0" },
        },
        "blob-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(2%, -3%) scale(1.05)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(220px) rotate(340deg)", opacity: "0" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.35s cubic-bezier(.34,1.56,.64,1)",
        "slide-up": "slide-up 0.4s cubic-bezier(.22,1,.36,1)",
        "toast-in": "toast-in 0.2s ease-out",
        "float-up-fade": "float-up-fade 0.9s ease-out forwards",
        "blob-drift": "blob-drift 9s ease-in-out infinite",
        "blob-drift-slow": "blob-drift 13s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
