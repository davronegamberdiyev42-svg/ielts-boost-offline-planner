import type { ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useColors } from "../../hooks/use-colors";
import { Typography } from "./typography";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colors = useColors();
  const palette = {
    primary: [colors.primary, colors.primaryForeground],
    secondary: [colors.secondary, colors.secondaryForeground],
    outline: ["transparent", colors.foreground],
    ghost: ["transparent", colors.foreground],
    destructive: [colors.destructive, colors.destructiveForeground],
  }[variant];
  const sizes = {
    sm: { minHeight: 36, paddingHorizontal: 12 },
    md: { minHeight: 46, paddingHorizontal: 16 },
    lg: { minHeight: 54, paddingHorizontal: 20 },
    icon: { minHeight: 44, minWidth: 44, paddingHorizontal: 8 },
  }[size];
  const text =
    typeof children === "string" || typeof children === "number" ? (
      <Typography
        variant="button"
        tone={variant === "outline" || variant === "ghost" ? "foreground" : "primaryForeground"}
        style={{
          color:
            variant === "secondary"
              ? colors.secondaryForeground
              : variant === "outline" || variant === "ghost"
                ? colors.foreground
                : palette[1],
          textAlign: "center",
        }}
      >
        {children}
      </Typography>
    ) : (
      children
    );

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        {
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: colors.spacing * 2,
          borderRadius: colors.radius,
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: colors.border,
          backgroundColor: palette[0],
          opacity: disabled ? 0.48 : pressed ? 0.78 : 1,
        },
        sizes,
        style,
      ]}
    >
      {text}
    </Pressable>
  );
}
