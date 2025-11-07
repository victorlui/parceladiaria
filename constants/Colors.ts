/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Colors object
export const Colors = {
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
  primaryColor: "#7FD223",
  borderColor: "#d1d5db",
  white: "#fff",
  black: "#000",
  green: {
    primary: "#0F766E",
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
  info: {
    bg: "#E0F2FE",
    text: "#0284C7",
  },
  success: {
    light: "#D1FAE5", // verde claro (gradiente start)
    medium: "#A7F3D0", // verde médio (gradiente end)
  },
};
