import React, { useMemo } from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@workspace/ielts-boost-design-system/components/native/card";
import { Progress } from "@workspace/ielts-boost-design-system/components/native/progress";
import { Typography } from "@workspace/ielts-boost-design-system/components/native/typography";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";
import { useAppData } from "@/context/AppDataContext";
import { todayKey } from "@/lib/reading-plan";
import { buildWeeklyReport, calculateStreaks } from "@/lib/streak-report";

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, ready, storageError } = useAppData();
  const today = todayKey();
  const streaks = useMemo(
    () => calculateStreaks(data.readingDays, today),
    [data.readingDays, today],
  );
  const week = useMemo(
    () => buildWeeklyReport(data.readingDays, today),
    [data.readingDays, today],
  );
  const bottomSpace = Platform.OS === "web" ? 34 : insets.bottom;
  const dateRange = `${week.start.slice(8)}.${week.start.slice(5, 7)}–${week.end.slice(
    8,
  )}.${week.end.slice(5, 7)}`;

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography tone="mutedForeground">Hisobot yuklanmoqda…</Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: colors.spacing * 4,
          paddingTop: Platform.OS === "web" ? 67 : colors.spacing * 3,
          paddingBottom: Math.max(bottomSpace, 20) + 24,
          gap: colors.spacing * 3,
        }}
      >
        <View style={{ gap: colors.spacing }}>
          <Typography variant="caption" tone="mutedForeground">
            IELTS BOOST
          </Typography>
          <Typography variant="title">Streak va hisobot</Typography>
          <Typography tone="mutedForeground">
            Hisob faqat Reading rejasida belgilangan ishlar va yozilgan vaqtga asoslanadi.
            Ma’lumot telefonda qoladi.
          </Typography>
        </View>

        <View style={{ flexDirection: "row", gap: colors.spacing * 2 }}>
          <Card style={{ flex: 1, gap: colors.spacing }}>
            <Typography variant="caption" tone="mutedForeground">
              Joriy streak
            </Typography>
            <Typography variant="title">{streaks.current} kun</Typography>
            <Typography variant="caption" tone="mutedForeground">
              Ketma-ket o‘qilgan kunlar
            </Typography>
          </Card>
          <Card style={{ flex: 1, gap: colors.spacing }}>
            <Typography variant="caption" tone="mutedForeground">
              Eng uzun streak
            </Typography>
            <Typography variant="title">{streaks.best} kun</Typography>
            <Typography variant="caption" tone="mutedForeground">
              Saqlangan yozuvlar ichida
            </Typography>
          </Card>
        </View>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Haftalik hisobot</Typography>
          <Typography variant="caption" tone="mutedForeground">
            Dushanba–yakshanba · {dateRange}
          </Typography>
          <View style={{ flexDirection: "row", gap: colors.spacing * 2 }}>
            <Typography style={{ flex: 1 }}>
              Faol kunlar: {week.activeDays}/7
            </Typography>
            <Typography style={{ flex: 1 }}>
              O‘qish vaqti: {week.totalMinutes} daqiqa
            </Typography>
          </View>
          <Typography>Belgilangan topshiriqlar: {week.completedTasks}</Typography>
          <Progress
            value={(week.activeDays / 7) * 100}
            accessibilityLabel="Haftalik faol kunlar"
          />
          <View style={{ gap: colors.spacing * 2 }}>
            {week.days.map((day) => (
              <View
                key={day.date}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: colors.spacing * 2,
                }}
              >
                <Typography style={{ flex: 1 }}>
                  {day.weekday} · {day.date.slice(8)}.{day.date.slice(5, 7)}
                </Typography>
                <Typography variant="caption" tone="mutedForeground">
                  {day.active ? "O‘qildi" : "Belgi yo‘q"}
                  {day.minutes ? ` · ${day.minutes} daq.` : ""}
                  {day.completedTasks ? ` · ${day.completedTasks} vazifa` : ""}
                </Typography>
              </View>
            ))}
          </View>
        </Card>

        {storageError ? (
          <Typography variant="caption" tone="destructive">
            {storageError}
          </Typography>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
