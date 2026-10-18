import { TextInput, type TextInputProps, type StyleProp, type TextStyle } from "react-native";
import { useColors } from "../../hooks/use-colors";

type TextareaProps = TextInputProps & { style?: StyleProp<TextStyle> };

export function Textarea({ style, placeholderTextColor, ...props }: TextareaProps) {
  const colors = useColors();

  return (
    <TextInput
      {...props}
      multiline
      textAlignVertical="top"
      placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
      selectionColor={colors.primary}
      style={[
        {
          minHeight: 100,
          paddingHorizontal: colors.spacing * 3,
          paddingVertical: colors.spacing * 3,
          borderRadius: colors.radius * 0.75,
          borderWidth: 1,
          borderColor: colors.input,
          backgroundColor: colors.card,
          color: colors.foreground,
          fontFamily: colors.typography.sans,
          fontSize: 16,
          lineHeight: 23,
        },
        style,
      ]}
    />
  );
}
