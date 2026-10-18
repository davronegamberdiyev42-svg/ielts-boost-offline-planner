import type { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";
import { useColors } from "../../hooks/use-colors";
import { Typography } from "./typography";

type BadgeProps = PropsWithChildren<
  ViewProps & { variant?: "default" | "success" | "destructive" }
>;

export function Badge({ children, variant = "default", style, ...props }: BadgeProps) {
  const colors = useColors();
  const background =
    variant === "success"
      ? colors.accent
      : variant === "destructive"
        ? colors.destructive
        : colors.secondary;
  const foreground =
    variant === "success"
      ? colors.accentForeground
      : variant === "destructive"
        ? colors.destructiveForeground
        : colors.secondaryForeground;

  return (
    <View
      {...props}
      style={[
        {
          alignSelf: "flex-start",
          paddingHorizontal: colors.spacing * 2,
          paddingVertical: colors.spacing,
          borderRadius: colors.radius,
          backgroundColor: background,
        },
        style,
      ]}
    >
      <Typography variant="caption" style={{ color: foreground, fontWeight: "600" }}>
        {children}
      </Typography>
    </View>
  );
}
