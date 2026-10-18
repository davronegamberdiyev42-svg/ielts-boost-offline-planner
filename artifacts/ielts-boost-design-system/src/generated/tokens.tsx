/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f3eee4",
      "foreground": "#17332a",
      "border": "#dcd3c0",
      "card": "#fffdf8",
      "cardForeground": "#17332a",
      "popover": "#fffdf8",
      "popoverForeground": "#17332a",
      "primary": "#c83c25",
      "primaryForeground": "#fffdf8",
      "secondary": "#ece3cf",
      "secondaryForeground": "#17332a",
      "muted": "#ece3cf",
      "mutedForeground": "#68776f",
      "accent": "#1d7a52",
      "accentForeground": "#ffffff",
      "destructive": "#c03924",
      "destructiveForeground": "#ffffff",
      "input": "#dcd3c0",
      "ring": "#c83c25",
      "chart1": "#c83c25",
      "chart2": "#1d7a52",
      "chart3": "#17332a",
      "chart4": "#c48b25",
      "chart5": "#927156",
      "sidebar": "#fffdf8",
      "sidebarForeground": "#17332a",
      "sidebarBorder": "#dcd3c0",
      "sidebarPrimary": "#c83c25",
      "sidebarPrimaryForeground": "#fffdf8",
      "sidebarAccent": "#ece3cf",
      "sidebarAccentForeground": "#17332a",
      "sidebarRing": "#c83c25"
    },
    "dark": {
      "background": "#0d1a16",
      "foreground": "#e8efe9",
      "border": "#264037",
      "card": "#15261f",
      "cardForeground": "#e8efe9",
      "popover": "#15261f",
      "popoverForeground": "#e8efe9",
      "primary": "#ff7a59",
      "primaryForeground": "#0d1a16",
      "secondary": "#1c3128",
      "secondaryForeground": "#e8efe9",
      "muted": "#1c3128",
      "mutedForeground": "#8fa398",
      "accent": "#4fcf93",
      "accentForeground": "#0d1a16",
      "destructive": "#ff7a59",
      "destructiveForeground": "#0d1a16",
      "input": "#264037",
      "ring": "#ff7a59",
      "chart1": "#ff7a59",
      "chart2": "#4fcf93",
      "chart3": "#e8efe9",
      "chart4": "#e4b04a",
      "chart5": "#9ebfac",
      "sidebar": "#15261f",
      "sidebarForeground": "#e8efe9",
      "sidebarBorder": "#264037",
      "sidebarPrimary": "#ff7a59",
      "sidebarPrimaryForeground": "#0d1a16",
      "sidebarAccent": "#1c3128",
      "sidebarAccentForeground": "#e8efe9",
      "sidebarRing": "#ff7a59"
    }
  },
  "fontFamily": {
    "sans": [
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "ui-monospace",
      "Menlo",
      "monospace"
    ]
  },
  "radius": "1rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
