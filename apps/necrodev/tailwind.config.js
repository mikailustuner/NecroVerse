/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0612",
        "accent-glow": "#a855f7",
        highlight: "#00fff7",
        warning: "#ff006e",
        text: "#f5f5f5",
        shadow: "#1c1024",
      },
      fontFamily: {
        primary: ["Orbitron", "Space Grotesk", "sans-serif"],
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)" },
          "50%": { opacity: 0.8, boxShadow: "0 0 20px rgba(168, 85, 247, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};

