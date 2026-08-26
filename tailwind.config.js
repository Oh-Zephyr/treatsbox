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
        paper: "#F7EFDD",
        paper2: "#F1E6CC",
        ink: "#241B14",
        ink2: "#4A3A2A",
        marigold: "#E8A93B",
        marigold2: "#C98A22",
        oxblood: "#8C3B2E",
        forest: "#3F6B4A",
        alert: "#C1462F",
        line: "#E4D6B8",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(36,27,20,0.04), 0 8px 24px -8px rgba(36,27,20,0.14)",
        pop: "0 4px 14px -2px rgba(36,27,20,0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.94)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-in": {
          "0%": { transform: "translateY(8px) scale(0.98)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.25s ease-out",
        "slide-up": "slide-up 0.35s ease-out",
        "toast-in": "toast-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
