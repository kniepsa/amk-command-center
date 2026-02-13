/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        // Midnight palette - Deep dark backgrounds
        midnight: {
          950: "#0A0A0F", // Deepest background
          900: "#11111A", // Card backgrounds
          800: "#1A1A28", // Elevated surfaces
          750: "#1F1F2F", // Hover surfaces
          700: "#242438", // Borders and dividers
          600: "#2E2E48", // Lighter borders
        },
        // Glass transparency colors
        glass: {
          border: "rgba(255, 255, 255, 0.08)",
          surface: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.06)",
        },
        // Electric primary colors
        electric: {
          500: "#00D9FF", // Primary accent
          600: "#00B8D4", // Hover state
        },
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-lg": "0 16px 64px 0 rgba(0, 0, 0, 0.5)",
        button: "0 4px 16px rgba(0, 217, 255, 0.3)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "confetti-fall": "confetti-fall 2s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translateY(100vh) rotate(360deg)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
};
