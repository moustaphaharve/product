/**
 * Design tokens for Product.
 * Dark mode is the default. Light mode is a conservative inversion.
 *
 * Reference atmosphere: Cursor + Linear + Claude Desktop + Antioch.
 * Not a SaaS dashboard. Not a CAD tool. A professional builder's tool.
 */

export const tokens = {
  color: {
    dark: {
      bgPrimary: "#0A0A0A",
      bgSecondary: "#141414",
      bgTertiary: "#1C1C1C",
      bgInput: "#0F0F0F",
      borderPrimary: "rgba(255, 255, 255, 0.08)",
      borderSecondary: "rgba(255, 255, 255, 0.12)",
      borderFocus: "rgba(255, 255, 255, 0.2)",
      textPrimary: "#FAFAFA",
      textSecondary: "rgba(255, 255, 255, 0.6)",
      textTertiary: "rgba(255, 255, 255, 0.4)",
      accentPrimary: "#FFFFFF",
      accentSubtle: "rgba(255, 255, 255, 0.08)",
      viewportBg: "#050505",
      viewportGrid: "rgba(255, 255, 255, 0.04)",
    },
    light: {
      bgPrimary: "#FFFFFF",
      bgSecondary: "#F7F7F7",
      bgTertiary: "#EDEDED",
      bgInput: "#FCFCFC",
      borderPrimary: "rgba(0, 0, 0, 0.08)",
      borderSecondary: "rgba(0, 0, 0, 0.12)",
      borderFocus: "rgba(0, 0, 0, 0.2)",
      textPrimary: "#0A0A0A",
      textSecondary: "rgba(0, 0, 0, 0.6)",
      textTertiary: "rgba(0, 0, 0, 0.4)",
      accentPrimary: "#0A0A0A",
      accentSubtle: "rgba(0, 0, 0, 0.06)",
      viewportBg: "#F3F3F3",
      viewportGrid: "rgba(0, 0, 0, 0.05)",
    },
    semantic: {
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
      info: "#3B82F6",
    },
  },
  font: {
    sans: `"Inter", -apple-system, system-ui, sans-serif`,
    mono: `"JetBrains Mono", "SF Mono", Menlo, monospace`,
  },
  fontSize: {
    xs: "11px",
    sm: "13px",
    base: "14px",
    md: "15px",
    lg: "18px",
    xl: "22px",
    xxl: "32px",
  },
  spacing: {
    "0": "0",
    "0.5": "2px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
  },
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
  },
  motion: {
    micro: "150ms cubic-bezier(0, 0, 0.2, 1)",
    panel: "300ms cubic-bezier(0.16, 1, 0.3, 1)",
    entrance: "400ms cubic-bezier(0.16, 1, 0.3, 1)",
    state: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    view: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type Tokens = typeof tokens;
