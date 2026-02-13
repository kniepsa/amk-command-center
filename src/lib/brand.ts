/**
 * Brand constants for AMK Command Center
 * Minimalist Resend-style design system
 */

export const BRAND = {
  colors: {
    primary: "#00D9FF", // electric-500
    primaryHover: "#00B8D4", // electric-600
    background: {
      dark: "#0A0A0F", // midnight-950
      card: "#11111A", // midnight-900
      elevated: "#1A1A28", // midnight-800
    },
    border: {
      default: "rgba(255, 255, 255, 0.08)",
      accent: "#00D9FF",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
      muted: "rgba(255, 255, 255, 0.4)",
    },
  },
  typography: {
    fontFamily: {
      sans: "Inter, system-ui, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
  },
} as const;
