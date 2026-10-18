import {
  TextInput,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { useColors } from "../../hooks/use-colors";

type InputProps = TextInputProps & { style?: StyleProp<TextStyle> };

export function Input({
  style,
  placeholderTextColor,
  ...props
}: InputProps) {
  const colors = useColors();

  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
      selectionColor={colors.primary}
      style={[
        {
          minHeight: 48,
          paddingHorizontal: colors.spacing * 3,
          paddingVertical: colors.spacing * 2,
          borderRadius: colors.radius * 0.75,
          borderWidth: 1,
          borderColor: colors.input,
          backgroundColor: colors.card,
          color: colors.foreground,
          fontFamily: colors.typography.sans,
          fontSize: 16,
        },
        style,
      ]}
    />
  );
}
