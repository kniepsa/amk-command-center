/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        // Light Resend-inspired palette
        cloud: {
          50: "#FAFAFA", // Main background (off-white)
          100: "#F5F5F5", // Subtle backgrounds
          200: "#E5E5E5", // Borders
          300: "#D4D4D4", // Hover borders
          400: "#A3A3A3", // Muted text
          500: "#737373", // Secondary text
          600: "#525252", // Primary text
        },
        // Clean white surfaces
        surface: {
          white: "#FFFFFF",
          hover: "#FAFAFA",
        },
        // Subtle accent (Resend-style)
        accent: {
          500: "#18181B", // Dark accent for text/buttons
          hover: "#27272A",
        },
        // Optional: Keep electric for interactive elements
        electric: {
          500: "#0EA5E9", // Sky blue (lighter than previous)
          600: "#0284C7", // Hover state
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
        "touch-feedback": "touch-feedback 0.3s ease-out",
      },
      keyframes: {
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translateY(100vh) rotate(360deg)",
            opacity: "0",
          },
        },
        "touch-feedback": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      spacing: {
        "touch-min": "44px", // iOS minimum touch target
        "touch-comfortable": "48px", // Android recommended
        "safe-bottom": "env(safe-area-inset-bottom)", // iPhone notch/home indicator
        "safe-top": "env(safe-area-inset-top)",
      },
    },
  },
  plugins: [],
};
