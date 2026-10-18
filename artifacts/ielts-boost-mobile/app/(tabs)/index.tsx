import React, { useMemo, useState } from "react";
import { Linking, Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@workspace/ielts-boost-design-system/components/native/button";
import { Card } from "@workspace/ielts-boost-design-system/components/native/card";
import { Checkbox } from "@workspace/ielts-boost-design-system/components/native/checkbox";
import { Input } from "@workspace/ielts-boost-design-system/components/native/input";
import { Progress } from "@workspace/ielts-boost-design-system/components/native/progress";
import { Textarea } from "@workspace/ielts-boost-design-system/components/native/textarea";
import { Typography } from "@workspace/ielts-boost-design-system/components/native/typography";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";
import { useAppData } from "@/context/AppDataContext";
import {
  dateDifference,
  formatUzbekDate,
  isValidDateKey,
  readingDayInfo,
  shiftDateKey,
  todayKey,
} from "@/lib/reading-plan";
import { isYouTubeLink, SHADOWING_SEARCH_URL } from "@/lib/youtube";

const dateInputPattern = /^\d{4}-\d{2}-\d{2}$/;

export default function ReadingPlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    data,
    ready,
    storageError,
    setPlanStartDate,
    toggleReadingBlock,
    setReadingNote,
    setReadingMetric,
    setShadowingLink,
    startTimer,
  } = useAppData();
  const today = todayKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateDraft, setDateDraft] = useState(today);
  const [dateError, setDateError] = useState("");
  const [timerMessage, setTimerMessage] = useState("");
  const [shadowingMessage, setShadowingMessage] = useState("");
  const day = useMemo(
    () => readingDayInfo(data.planStartDate, selectedDate),
    [data.planStartDate, selectedDate],
  );
  const log = data.readingDays[selectedDate] ?? {
    completedBlockIds: [],
    note: "",
    metrics: {},
  };
  const minutesDone = day.bl
    .filter((block) => log.completedBlockIds.includes(block.id))
    .reduce((sum, block) => sum + block.m, 0);
  const totalMinutes = day.bl.reduce((sum, block) => sum + block.m, 0);
  const bottomSpace = Platform.OS === "web" ? 34 : insets.bottom;

  const beginPlan = async () => {
    if (!dateInputPattern.test(dateDraft) || !isValidDateKey(dateDraft)) {
      setDateError("Sanani YYYY-MM-DD ko‘rinishida kiriting.");
      return;
    }
    const saved = await setPlanStartDate(dateDraft);
    if (!saved) return;
    setSelectedDate(dateDraft);
    setDateError("");
  };

  const startBlockTimer = async (title: string, minutes: number) => {
    setTimerMessage("");
    const result = await startTimer(title, minutes * 60);
    if (!result.started) {
      setTimerMessage("Avval ishlayotgan taymerni yakunlang yoki to‘xtating.");
      return;
    }
    if (result.notification === "denied") {
      setTimerMessage(
        "Taymer boshlandi, lekin bildirishnoma ruxsati berilmadi. Taymer ilova yopiq bo‘lganda ham vaqtni hisoblaydi, ammo ovozli xabar kelmasligi mumkin.",
      );
    } else if (result.notification === "unsupported") {
      setTimerMessage(
        "Taymer telefonda saqlanadi. Ovozli bildirishnoma faqat Expo mobil ilovasida ishlaydi.",
      );
    } else if (result.notification === "error") {
      setTimerMessage(
        "Taymer ishga tushdi, lekin bildirishnomani rejalashtirib bo‘lmadi. Ruxsatlarni tekshiring.",
      );
    } else {
      setTimerMessage("Taymer boshlandi. Tugaganda ovozli bildirishnoma rejalashtirildi.");
    }
  };

  const openShadowing = async () => {
    const link = (data.shadowingLinks[selectedDate] ?? "").trim();
    if (link && !isYouTubeLink(link)) {
      setShadowingMessage(
        "Havola yaroqsiz. https://youtube.com yoki https://youtu.be manzilini kiriting.",
      );
      return;
    }
    setShadowingMessage("");
    try {
      await Linking.openURL(link || SHADOWING_SEARCH_URL);
    } catch {
      setShadowingMessage("YouTube havolasini ochib bo‘lmadi. Telefoningizda brauzerni tekshiring.");
    }
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography tone="mutedForeground">Telefondagi ma’lumotlar yuklanmoqda…</Typography>
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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: colors.spacing * 4,
          paddingTop: Platform.OS === "web" ? 67 : colors.spacing * 3,
          paddingBottom: Math.max(bottomSpace, 20) + 24,
          gap: colors.spacing * 3,
        }}
      >
        <View style={{ gap: colors.spacing }}>
          <Typography variant="caption" tone="mutedForeground">
            IELTS BOOST · READING
          </Typography>
          <Typography variant="title">84 kunlik Reading rejasi</Typography>
          <Typography tone="mutedForeground">
            Reja va yozuvlaringiz faqat shu telefonda saqlanadi.
          </Typography>
        </View>

        {storageError ? (
          <Card accessibilityRole="alert">
            <Typography variant="label" tone="destructive">
              Saqlash muammosi
            </Typography>
            <Typography variant="caption" tone="mutedForeground" style={{ marginTop: 4 }}>
              {storageError}
            </Typography>
          </Card>
        ) : null}

        {!data.planStartDate ? (
          <Card style={{ gap: colors.spacing * 3 }}>
            <Typography variant="heading">Rejani boshlash</Typography>
            <Typography tone="mutedForeground">
              1-kun tanlangan sanadan hisoblanadi. Dushanba bo‘lishi shart emas.
            </Typography>
            <View style={{ gap: colors.spacing }}>
              <Typography variant="label">Boshlanish sanasi</Typography>
              <Input
                accessibilityLabel="Reja boshlanish sanasi"
                value={dateDraft}
                onChangeText={setDateDraft}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                testID="reading-start-date"
              />
              {dateError ? (
                <Typography variant="caption" tone="destructive">
                  {dateError}
                </Typography>
              ) : null}
            </View>
            <Button onPress={() => void beginPlan()} testID="begin-reading-plan">
              Rejani shu sanadan boshlash
            </Button>
          </Card>
        ) : (
          <>
            <Card style={{ gap: colors.spacing * 3 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: colors.spacing,
                }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  accessibilityLabel="Oldingi kun"
                  onPress={() => setSelectedDate(shiftDateKey(selectedDate, -1))}
                  testID="previous-reading-day"
                >
                  ‹
                </Button>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Typography variant="heading" style={{ textAlign: "center" }}>
                    {day.n >= 1 && day.n <= 84
                      ? `${day.w}-hafta, ${day.c}-kun`
                      : day.n > 84
                        ? "Reja yakunlandi"
                        : "Reja hali boshlanmagan"}
                  </Typography>
                  <Typography variant="caption" tone="mutedForeground">
                    {formatUzbekDate(selectedDate)}
                  </Typography>
                </View>
                <Button
                  variant="outline"
                  size="icon"
                  accessibilityLabel="Keyingi kun"
                  onPress={() => setSelectedDate(shiftDateKey(selectedDate, 1))}
                  testID="next-reading-day"
                >
                  ›
                </Button>
              </View>
              {selectedDate !== today ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setSelectedDate(today)}
                  testID="reading-today"
                >
                  Bugunga qaytish
                </Button>
              ) : null}
            </Card>

            {day.n < 1 ? (
              <Card style={{ gap: colors.spacing * 2 }}>
                <Typography variant="heading">Reja boshlanishini kutmoqda</Typography>
                <Typography tone="mutedForeground">
                  Reja {formatUzbekDate(data.planStartDate ?? today)} kuni boshlanadi.
                </Typography>
                <Button
                  variant="outline"
                  onPress={() => setSelectedDate(data.planStartDate ?? today)}
                >
                  1-kunga o‘tish
                </Button>
              </Card>
            ) : day.n > 84 ? (
              <Card style={{ gap: colors.spacing * 2 }}>
                <Typography variant="heading">84 kunlik reja yakunlandi</Typography>
                <Typography tone="mutedForeground">
                  Mavjud Reading rejasi tugadi. Oldingi kunlarni ko‘rish uchun chap
                  tugmani bosing.
                </Typography>
              </Card>
            ) : (
              <>
                <Card style={{ gap: colors.spacing * 2 }}>
                  <Typography variant="label">
                    Bajarildi: {minutesDone} / {totalMinutes} daqiqa
                  </Typography>
                  <Progress value={minutesDone} maximum={totalMinutes} />
                  <Typography variant="caption" tone="mutedForeground">
                    {day.n}-kun
                  </Typography>
                </Card>

                {day.bl.map((block) => {
                  const checked = log.completedBlockIds.includes(block.id);
                  const metrics =
                    block.id === "v"
                      ? [
                          ["ok", "To‘g‘ri"],
                          ["tt", "Jami savol"],
                          ["mn", "Daqiqa"],
                        ]
                      : block.id === "m"
                        ? [
                            ["sc", "Ball /40"],
                            ["p1", "1-p. daq."],
                            ["p2", "2-p. daq."],
                            ["p3", "3-p. daq."],
                          ]
                        : [];
                  return (
                    <Card key={block.id} style={{ gap: colors.spacing * 2 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: colors.spacing,
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          label={`${block.t}, ${block.m} daqiqa`}
                          onPress={() => void toggleReadingBlock(selectedDate, block.id)}
                          testID={`reading-done-${block.id}`}
                        />
                        <View style={{ flex: 1 }}>
                          <Typography variant="heading">{block.t}</Typography>
                          <Typography variant="caption" tone="mutedForeground">
                            {block.m} daqiqa
                          </Typography>
                        </View>
                      </View>
                      <Typography tone="mutedForeground">{block.h}</Typography>
                      {metrics.length ? (
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: colors.spacing * 2,
                          }}
                        >
                          {metrics.map(([key, label]) => (
                            <View
                              key={key}
                              style={{ flexBasis: "46%", flexGrow: 1, gap: 4 }}
                            >
                              <Typography variant="caption" tone="mutedForeground">
                                {label}
                              </Typography>
                              <Input
                                accessibilityLabel={label}
                                value={log.metrics[key] ?? ""}
                                onChangeText={(value) =>
                                  void setReadingMetric(selectedDate, key, value)
                                }
                                keyboardType="numeric"
                                testID={`reading-metric-${key}`}
                              />
                            </View>
                          ))}
                        </View>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={Boolean(data.activeTimer)}
                        onPress={() => void startBlockTimer(block.t, block.m)}
                        testID={`reading-timer-${block.id}`}
                      >
                        Taymer bilan boshlash
                      </Button>
                    </Card>
                  );
                })}

                <Card style={{ gap: colors.spacing * 2 }}>
                  <Typography variant="heading">Shadowing</Typography>
                  <Typography variant="caption" tone="mutedForeground">
                    O‘zingiz tanlagan YouTube havolasini shu kun uchun saqlang.
                    Havola qo‘shilmasa, umumiy YouTube qidiruvi ochiladi.
                  </Typography>
                  <Typography variant="label">Link qo‘shish</Typography>
                  <Input
                    accessibilityLabel="Shadowing uchun YouTube havolasi"
                    value={data.shadowingLinks[selectedDate] ?? ""}
                    onChangeText={(value) => {
                      setShadowingMessage("");
                      void setShadowingLink(selectedDate, value);
                    }}
                    placeholder="https://www.youtube.com/..."
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    testID="shadowing-youtube-link"
                  />
                  {!data.shadowingLinks[selectedDate]?.trim() ? (
                    <Typography
                      variant="caption"
                      tone="mutedForeground"
                      selectable
                      style={{ width: "100%" }}
                    >
                      Qidiruv havolasi: {SHADOWING_SEARCH_URL}
                    </Typography>
                  ) : null}
                  <Button
                    variant="outline"
                    onPress={() => void openShadowing()}
                    testID="open-shadowing-video"
                  >
                    {data.shadowingLinks[selectedDate]?.trim()
                      ? "Videoni YouTube’da ochish"
                      : "YouTube’da Shadowing qidirish"}
                  </Button>
                  {shadowingMessage ? (
                    <Typography variant="caption" tone="destructive">
                      {shadowingMessage}
                    </Typography>
                  ) : null}
                </Card>

                <Card style={{ gap: colors.spacing * 2 }}>
                  <Typography variant="heading">Kun eslatmasi</Typography>
                  <Textarea
                    accessibilityLabel="Kun eslatmasi"
                    value={log.note}
                    onChangeText={(value) => void setReadingNote(selectedDate, value)}
                    placeholder="Bugungi mashg‘ulotdan eslatma…"
                    testID="reading-day-note"
                  />
                </Card>
              </>
            )}
          </>
        )}

        {timerMessage ? (
          <Card accessibilityRole="alert">
            <Typography variant="caption">{timerMessage}</Typography>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
