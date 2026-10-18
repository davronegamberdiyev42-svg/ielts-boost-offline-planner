import type { TextProps } from "react-native";
import { Text } from "react-native";
import { useColors } from "../../hooks/use-colors";

export type TypographyVariant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "button"
  | "label"
  | "caption"
  | "timer";

export type TypographyTone =
  | "foreground"
  | "mutedForeground"
  | "primary"
  | "accent"
  | "destructive"
  | "primaryForeground"
  | "accentForeground";

const variantStyles = {
  display: { fontSize: 36, lineHeight: 42, fontWeight: "700" as const, serif: true },
  title: { fontSize: 27, lineHeight: 33, fontWeight: "700" as const, serif: true },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const, serif: true },
  body: { fontSize: 16, lineHeight: 23, fontWeight: "400" as const, serif: false },
  button: { fontSize: 15, lineHeight: 20, fontWeight: "600" as const, serif: false },
  label: { fontSize: 14, lineHeight: 19, fontWeight: "600" as const, serif: false },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const, serif: false },
  timer: { fontSize: 56, lineHeight: 64, fontWeight: "700" as const, serif: false },
};

type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  tone?: TypographyTone;
};

export function Typography({
  variant = "body",
  tone = "foreground",
  style,
  ...props
}: TypographyProps) {
  const colors = useColors();
  const scale = variantStyles[variant];

  return (
    <Text
      {...props}
      style={[
        {
          color: colors[tone],
          fontFamily: scale.serif
            ? colors.typography.serif
            : variant === "timer"
              ? colors.typography.mono
              : colors.typography.sans,
          fontSize: scale.fontSize,
          fontWeight: scale.fontWeight,
          lineHeight: scale.lineHeight,
        },
        style,
      ]}
    />
  );
}
