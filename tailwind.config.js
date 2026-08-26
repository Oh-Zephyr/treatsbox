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
        // Warm ivory / cream — the brand's foundation
        paper: "#FBF3E7",
        paper2: "#F1E3C8",
        // Deep espresso — near-black, warm, editorial (not flat #000)
        ink: "#2B1B12",
        ink2: "#6B5645",
        // Rich warm amber-gold — the accent
        marigold: "#C8963E",
        marigold2: "#A97A2E",
        // Primary CTA color — espresso, for strong contrast (never blue)
        oxblood: "#241509",
        oxblood2: "#4A2E12",
        // Muted olive — positive/queued states
        forest: "#6E7A4E",
        // Muted brick — alerts, kept out of the gold/espresso family so it reads distinctly
        alert: "#A9432F",
        line: "#DEC9A8",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,27,18,0.05), 0 14px 34px -12px rgba(43,27,18,0.22)",
        pop: "0 10px 28px -6px rgba(43,27,18,0.32)",
      },
      borderRadius: {
        xl2: "1.5rem",
        blob: "63% 37% 54% 46% / 55% 48% 52% 45%",
        blob2: "42% 58% 61% 39% / 45% 41% 59% 55%",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
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
        "fade-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "sparkle-up": {
          "0%": { transform: "translateY(0) scale(0.7)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateY(-26px) scale(1)", opacity: "0" },
        },
        "petal-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "0.9" },
          "100%": { transform: "translateY(160px) rotate(200deg)", opacity: "0" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.3s cubic-bezier(.3,1.4,.6,1)",
        "slide-up": "slide-up 0.4s cubic-bezier(.22,1,.36,1)",
        "toast-in": "toast-in 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out both",
        "sparkle-up": "sparkle-up 0.8s ease-out forwards",
        "petal-fall": "petal-fall 1.5s ease-in forwards",
      },
    },
  },
  plugins: [],
};
