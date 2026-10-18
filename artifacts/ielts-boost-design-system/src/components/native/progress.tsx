import { View, type ViewProps } from "react-native";
import { useColors } from "../../hooks/use-colors";

type ProgressProps = ViewProps & {
  value: number;
  maximum?: number;
  color?: "primary" | "accent";
};

export function Progress({ value, maximum = 100, color = "accent", style, ...props }: ProgressProps) {
  const colors = useColors();
  const percentage = maximum > 0 ? Math.max(0, Math.min(100, (value / maximum) * 100)) : 0;

  return (
    <View
      {...props}
      accessibilityLabel={`Bajarilish ${Math.round(percentage)} foiz`}
      style={[
        {
          height: 8,
          overflow: "hidden",
          borderRadius: colors.radius,
          backgroundColor: colors.muted,
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${percentage}%`,
          height: "100%",
          borderRadius: colors.radius,
          backgroundColor: color === "primary" ? colors.primary : colors.accent,
        }}
      />
    </View>
  );
}
