import React from "react";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";

// IMPORTANT: iOS 26 uses NativeTabs for native tabs with liquid glass support.
// NativeTabs intentionally does NOT use custom design tokens — liquid glass
// is a system-level appearance provided by iOS and cannot be overridden.
// Custom brand colors are applied only on the ClassicTabLayout path (older iOS / Android / web).
function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "book.closed", selected: "book.closed.fill" }}
        />
        <NativeTabs.Trigger.Label>Reja</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="timer">
        <NativeTabs.Trigger.Icon sf={{ default: "timer", selected: "timer" }} />
        <NativeTabs.Trigger.Label>Taymer</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mock">
        <NativeTabs.Trigger.Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <NativeTabs.Trigger.Label>Mocklar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="speaking">
        <NativeTabs.Trigger.Icon sf={{ default: "waveform", selected: "waveform" }} />
        <NativeTabs.Trigger.Label>Speaking</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="writing">
        <NativeTabs.Trigger.Icon sf={{ default: "pencil.and.outline", selected: "pencil.and.outline" }} />
        <NativeTabs.Trigger.Label>Writing</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pronunciation">
        <NativeTabs.Trigger.Icon sf={{ default: "speaker.wave.2", selected: "speaker.wave.2.fill" }} />
        <NativeTabs.Trigger.Label>Talaffuz</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="report">
        <NativeTabs.Trigger.Icon sf={{ default: "calendar", selected: "calendar" }} />
        <NativeTabs.Trigger.Label>Hisobot</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84, paddingBottom: 34 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Reja",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="book.closed" tintColor={color} size={24} />
            ) : (
              <Feather name="book-open" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: "Taymer",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="timer" tintColor={color} size={24} />
            ) : (
              <Feather name="clock" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="mock"
        options={{
          title: "Mocklar",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={24} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="speaking"
        options={{
          title: "Speaking",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="waveform" tintColor={color} size={24} />
            ) : (
              <Feather name="mic" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="writing"
        options={{
          title: "Writing",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="pencil.and.outline" tintColor={color} size={24} />
            ) : (
              <Feather name="edit-3" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="pronunciation"
        options={{
          title: "Talaffuz",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="speaker.wave.2" tintColor={color} size={24} />
            ) : (
              <Feather name="volume-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Hisobot",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="calendar" tintColor={color} size={24} />
            ) : (
              <Feather name="calendar" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
