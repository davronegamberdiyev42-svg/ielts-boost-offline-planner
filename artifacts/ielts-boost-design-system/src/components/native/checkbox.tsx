import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { useColors } from "../../hooks/use-colors";

type CheckboxProps = Omit<PressableProps, "style"> & {
  checked: boolean;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({ checked, label, disabled, style, ...props }: CheckboxProps) {
  const colors = useColors();

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        { minWidth: 44, minHeight: 44, justifyContent: "center", opacity: pressed ? 0.72 : 1 },
        style,
      ]}
    >
      <View
        style={{
          width: 24,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: checked ? colors.accent : colors.border,
          borderRadius: colors.radius * 0.3,
          backgroundColor: checked ? colors.accent : colors.card,
        }}
      >
        {checked ? (
          <View
            style={{
              width: 11,
              height: 6,
              borderLeftWidth: 2,
              borderBottomWidth: 2,
              borderColor: colors.accentForeground,
              transform: [{ rotate: "-45deg" }],
              marginTop: -2,
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
