import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary: dark orange (matches the SafarGo logo)
        brand: {
          50: "#fff4ec",
          100: "#ffe4cf",
          200: "#ffc79e",
          300: "#ffa05f",
          400: "#ff7f2a",
          500: "#ff6a00",
          600: "#e55a00",
          700: "#bf4a00",
          800: "#8f3900",
          900: "#5e2600",
        },
        // Dark surfaces
        ink: {
          950: "#0a0a0b",
          900: "#101012",
          800: "#17171a",
          700: "#202024",
          600: "#2b2b31",
          500: "#44444c",
          400: "#71717a",
          300: "#a1a1aa",
          200: "#d4d4d8",
          100: "#f4f4f5",
        },
        sand: "#ffd9b3",
        mint: "#34d399",
        sky: "#38bdf8",
      },
      fontFamily: {
        display: ["'Outfit Variable'", "system-ui", "sans-serif"],
        sans: ["'Plus Jakarta Sans Variable'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(255,106,0,0.55)",
        card: "0 20px 50px -20px rgba(0,0,0,0.8)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        road: { from: { backgroundPosition: "0 0" }, to: { backgroundPosition: "-80px 0" } },
        drive: { from: { transform: "translateX(-20vw)" }, to: { transform: "translateX(110vw)" } },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        road: "road 1.2s linear infinite",
        drive: "drive 14s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
