import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          950: "#172554",
        },
      },
      boxShadow: {
        panel: "0 18px 55px rgba(30, 64, 175, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config
