import { Platform } from "react-native";
import { tokens, type Tokens } from "../generated/tokens";

type Palette = {
  [Key in keyof Tokens["color"]["light"]]: string;
};

function withLegacyAliases(palette: Palette) {
  return {
    ...palette,
    text: palette.foreground,
    tint: palette.primary,
  };
}

function toPixels(value: string) {
  const parsed = Number.parseFloat(value);
  return value.endsWith("rem") ? parsed * 16 : parsed;
}

export const nativeTheme = {
  light: withLegacyAliases(tokens.color.light),
  dark: withLegacyAliases(tokens.color.dark),
  radius: toPixels(tokens.radius),
  spacing: toPixels(tokens.spacing),
  typography: {
    sans:
      Platform.select({ ios: "System", android: "sans-serif", default: "System" }) ??
      "System",
    serif:
      Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }) ??
      "Georgia",
    mono:
      Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) ??
      "monospace",
  },
} as const;

export type NativeColors = ReturnType<typeof withLegacyAliases>;
