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
        // QuikSpit Auto Detailing brand colors
        "brand-charcoal": "#1a1a1a",
        "brand-charcoal-light": "#2a2a2a",
        "brand-red": "#ef4444",
        // Extended palette for premium feel
        "brand-gold": "#d4a574",
        "brand-silver": "#a8a8a8",
      },
      fontFamily: {
        sans: ["Raleway", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Bebas Neue", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 4px 6px -1px rgba(239, 68, 68, 0.10), 0 2px 4px -1px rgba(239, 68, 68, 0.06)",
        "brand-lg": "0 10px 15px -3px rgba(239, 68, 68, 0.10), 0 4px 6px -2px rgba(239, 68, 68, 0.05)",
        "glow": "0 0 40px rgba(239, 68, 68, 0.15)",
        "glow-lg": "0 0 60px rgba(239, 68, 68, 0.2)",
        "inner-glow": "inset 0 0 30px rgba(239, 68, 68, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-down": "slideDown 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "gradient-x": "gradientX 3s ease infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(239, 68, 68, 0.4)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer-gradient": "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
