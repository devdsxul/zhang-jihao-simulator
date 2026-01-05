import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1a1a2e",
        foreground: "#F5F5F5",
        barca: {
          primary: "#004D98",
          secondary: "#A50044",
          accent: "#EDBB00",
          dark: "#0A1628",
          light: "#1A2744",
          blue: "#0056A6",
          gold: "#FFD700",
          crimson: "#C8102E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Bebas Neue", "Impact", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out",
        "slide-in": "slideIn 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "bounce-slow": "bounce 2s infinite",
        "studying": "studying 2s ease-in-out infinite",
        "football": "football 1s ease-in-out infinite",
        "billiards": "billiards 2s ease-in-out infinite",
        "scrolling": "scrolling 1.5s ease-in-out infinite",
        "running": "running 0.5s ease-in-out infinite",
        "eating": "eating 1.5s ease-in-out infinite",
        "talking": "talking 0.8s ease-in-out infinite",
        "stressed": "stressed 0.3s ease-in-out infinite",
        "celebrating": "celebrating 0.5s ease-in-out infinite",
        "arrested": "arrested 1s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 77, 152, 0.5)",
        "glow-accent": "0 0 20px rgba(237, 187, 0, 0.5)",
        "glow-danger": "0 0 20px rgba(165, 0, 68, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
