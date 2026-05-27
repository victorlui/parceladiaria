/**
 * Application Colors
 * Organized by Themes, Base Palette, and Semantic Colors.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// --- Base Palette ---
// Common colors used across the application.
const palette = {
  white: "#fff",
  black: "#000",
  primary: "#053D39",
  border: "#d1d5db",

  green: {
    primary: "#053D39",
    button: "#14524A",
    secondary: "#10B981",
    text: "#2C8780",
  },
  blue: {
    primary: "#3B82F6",
  },
  gray: {
    primary: "#9CA3AF",
    text: "#64748B",
  },
  yellow: {
    light: "#FEF3C7", // fundo claro
    medium: "#FDE68A", // gradiente
  },
  orange: {
    primary: "#F59E0B",
  },
};

// --- Semantic Colors ---
// Colors that carry specific meaning (status, alerts, etc.)
const semantic = {
  info: {
    bg: "#E0F2FE",
    text: "#0284C7",
  },
  success: {
    light: "#D1FAE5", // verde claro (gradiente start)
    medium: "#A7F3D0", // verde médio (gradiente end)
  },
  error: {
    light: "#FEE2E2", // vermelho claro (gradiente start)
    medium: "#F87171", // vermelho médio (gradiente end)
  },
};

// --- Theme Colors ---
// Specific colors for Light and Dark modes.
const themes = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

// --- Exported Colors Object ---
// Maintaining backwards compatibility with existing imports
export const Colors = {
  // Themes
  ...themes,

  // Base / Root
  primaryColor: palette.primary,
  borderColor: palette.border,
  white: palette.white,
  black: palette.black,

  // Palettes
  green: palette.green,
  blue: palette.blue,
  gray: palette.gray,
  yellow: palette.yellow,
  orange: palette.orange,

  // Semantic
  ...semantic,
};
