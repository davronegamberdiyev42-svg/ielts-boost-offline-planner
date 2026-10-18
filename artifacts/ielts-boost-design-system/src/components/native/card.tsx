import type { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";
import { useColors } from "../../hooks/use-colors";

type CardProps = PropsWithChildren<ViewProps>;

export function Card({ children, style, ...props }: CardProps) {
  const colors = useColors();

  return (
    <View
      {...props}
      style={[
        {
          padding: colors.spacing * 4,
          borderRadius: colors.radius,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
