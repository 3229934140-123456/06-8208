/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8F0F8",
          100: "#C6DAEF",
          200: "#9CC0E3",
          300: "#6FA5D6",
          400: "#4D8FCC",
          500: "#0F4C81",
          600: "#0D4474",
          700: "#0A3A63",
          800: "#083152",
          900: "#052238",
        },
        mint: {
          50: "#E8FAF8",
          100: "#C5F3ED",
          200: "#9DE9DF",
          300: "#74DFD1",
          400: "#52D6C6",
          500: "#2EC4B6",
          600: "#28B0A3",
          700: "#20968B",
          800: "#187D73",
          900: "#0D5A53",
        },
        warning: {
          low: "#FFA94D",
          medium: "#FF8787",
          high: "#FF6B6B",
          critical: "#E03131",
        },
        risk: {
          safe: "#2EC4B6",
          low: "#74C0FC",
          medium: "#FFA94D",
          high: "#FF6B6B",
        },
        ink: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -2px rgba(15, 76, 129, 0.08), 0 2px 8px -2px rgba(15, 76, 129, 0.06)",
        "card-hover": "0 12px 40px -4px rgba(15, 76, 129, 0.15), 0 4px 12px -4px rgba(15, 76, 129, 0.1)",
        glow: "0 0 24px rgba(46, 196, 182, 0.3)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #0F4C81 0%, #1D6FA8 100%)",
        "gradient-mint": "linear-gradient(135deg, #2EC4B6 0%, #52D6C6 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in": "slideIn 0.4s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
