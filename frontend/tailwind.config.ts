import type { Config } from "tailwindcss";

const config: Config = {
  // Note: Tailwind v4 no longer needs 'content', but keeping it is harmless and helps some tooling.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // QuikSpit Shine brand colors
        "brand-charcoal": "#1a1a1a",
        "brand-charcoal-light": "#2a2a2a",
        "brand-red": "#ef4444",
      },
      fontFamily: {
        sans: ["Raleway", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 4px 6px -1px rgba(239, 68, 68, 0.10), 0 2px 4px -1px rgba(239, 68, 68, 0.06)",
        "brand-lg": "0 10px 15px -3px rgba(239, 68, 68, 0.10), 0 4px 6px -2px rgba(239, 68, 68, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
