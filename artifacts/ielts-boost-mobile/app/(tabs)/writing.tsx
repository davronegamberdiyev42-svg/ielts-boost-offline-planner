import React, { useEffect, useState } from "react";
import { AppState, Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@workspace/ielts-boost-design-system/components/native/button";
import { Card } from "@workspace/ielts-boost-design-system/components/native/card";
import { Checkbox } from "@workspace/ielts-boost-design-system/components/native/checkbox";
import { Input } from "@workspace/ielts-boost-design-system/components/native/input";
import { Textarea } from "@workspace/ielts-boost-design-system/components/native/textarea";
import { Typography } from "@workspace/ielts-boost-design-system/components/native/typography";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";
import {
  useAppData,
  type WritingTaskKey,
} from "@/context/AppDataContext";
import { formatUzbekDate, todayKey } from "@/lib/reading-plan";
import { countWords, writingChecklists } from "@/lib/writing-utils";

const labels: Record<WritingTaskKey, string> = {
  task1: "Task 1",
  task2: "Task 2",
};
const timerSeconds: Record<WritingTaskKey, number> = {
  task1: 20 * 60,
  task2: 40 * 60,
};

function formatClock(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;
}

export default function WritingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    data,
    ready,
    storageError,
    setWritingDraft,
    toggleWritingChecklist,
    addWritingError,
    startTimer,
    pauseTimer,
    resumeTimer,
  } = useAppData();
  const [task, setTask] = useState<WritingTaskKey>("task1");
  const [mistake, setMistake] = useState("");
  const [correction, setCorrection] = useState("");
  const [journalMessage, setJournalMessage] = useState("");
  const [timerMessage, setTimerMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const label = `${labels[task]} Writing`;
  const activeTimer = data.activeTimer?.label === label ? data.activeTimer : null;
  const timerFinished = data.lastTimerResult?.label === label;
  const timerBusy = Boolean(data.activeTimer && !activeTimer);
  const remainingMs = activeTimer
    ? activeTimer.pausedRemainingMs !== null
      ? activeTimer.pausedRemainingMs
      : Math.max(0, activeTimer.endsAt - now)
    : 0;
  const checklist =
    task === "task1" ? writingChecklists.task1 : writingChecklists.task2;
  const bottomSpace = Platform.OS === "web" ? 34 : insets.bottom;
  const text = data.writingDrafts[task] ?? "";

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 500);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const startWritingTimer = async () => {
    setTimerMessage("");
    const result = await startTimer(label, timerSeconds[task]);
    if (!result.started) {
      setTimerMessage(
        "Boshqa taymer ishlayapti. Avval Taymer bo‘limida uni yakunlang.",
      );
    } else if (result.notification !== "granted") {
      setTimerMessage(
        "Taymer ishlaydi. Ovozli bildirishnoma uchun telefonda ruxsat bering.",
      );
    }
  };

  const saveError = async () => {
    const cleanMistake = mistake.trim();
    const cleanCorrection = correction.trim();
    if (!cleanMistake || !cleanCorrection) {
      setJournalMessage("Xato va to‘g‘ri variantni kiriting.");
      return;
    }
    const saved = await addWritingError({
      date: todayKey(),
      mistake: cleanMistake,
      correction: cleanCorrection,
    });
    if (!saved) {
      setJournalMessage("Xatoni telefonga saqlab bo‘lmadi.");
      return;
    }
    setMistake("");
    setCorrection("");
    setJournalMessage("Xato jurnali yangilandi.");
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography tone="mutedForeground">Writing mashqi yuklanmoqda…</Typography>
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
            IELTS BOOST
          </Typography>
          <Typography variant="title">Writing mashqi</Typography>
          <Typography tone="mutedForeground">
            Matn, belgilangan bandlar va xato jurnali shu telefonda saqlanadi.
          </Typography>
        </View>

        <View style={{ flexDirection: "row", gap: colors.spacing }}>
          {(["task1", "task2"] as const).map((key) => (
            <Button
              key={key}
              variant={task === key ? undefined : "outline"}
              onPress={() => setTask(key)}
            >
              {labels[key]}
            </Button>
          ))}
        </View>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">{labels[task]} matni</Typography>
          <Typography variant="title">{countWords(text)} so‘z</Typography>
          <Textarea
            accessibilityLabel={`${labels[task]} javob matni`}
            value={text}
            onChangeText={(value) => void setWritingDraft(task, value)}
            placeholder="Javobingizni ingliz tilida shu yerga yozing…"
            testID={`writing-${task}-draft`}
          />
        </Card>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Vaqt taymeri</Typography>
          {activeTimer ? (
            <>
              <Typography variant="title">{formatClock(remainingMs)}</Typography>
              {activeTimer.pausedRemainingMs !== null ? (
                <Button onPress={() => void resumeTimer()}>
                  Taymerni davom ettirish
                </Button>
              ) : (
                <Button variant="outline" onPress={() => void pauseTimer()}>
                  Taymerni pauza qilish
                </Button>
              )}
            </>
          ) : (
            <>
              <Typography tone="mutedForeground">
                {task === "task1" ? "20 daqiqa" : "40 daqiqa"}.
                {timerFinished ? " Oldingi taymer tugagan." : ""}
              </Typography>
              <Button
                disabled={timerBusy}
                onPress={() => void startWritingTimer()}
                testID="start-writing-timer"
              >
                {labels[task]} taymerini boshlash
              </Button>
            </>
          )}
          {timerMessage ? (
            <Typography variant="caption" tone="mutedForeground">
              {timerMessage}
            </Typography>
          ) : null}
        </Card>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">{labels[task]} tekshiruv ro‘yxati</Typography>
          {checklist.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: colors.spacing * 2,
              }}
            >
              <Checkbox
                checked={Boolean(data.writingChecklist[task]?.[item.id])}
                label={item.text}
                onPress={() => void toggleWritingChecklist(task, item.id)}
              />
              <Typography style={{ flex: 1 }}>{item.text}</Typography>
            </View>
          ))}
        </Card>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Xato jurnali</Typography>
          <Input
            accessibilityLabel="Xato yoki noto‘g‘ri jumla"
            value={mistake}
            onChangeText={setMistake}
            placeholder="Xato yoki noto‘g‘ri jumla"
          />
          <Input
            accessibilityLabel="To‘g‘ri variant"
            value={correction}
            onChangeText={setCorrection}
            placeholder="To‘g‘ri variant"
          />
          {journalMessage ? (
            <Typography variant="caption" tone="mutedForeground">
              {journalMessage}
            </Typography>
          ) : null}
          <Button onPress={() => void saveError()} testID="save-writing-error">
            Xatoni jurnalga qo‘shish
          </Button>
          {storageError ? (
            <Typography variant="caption" tone="destructive">
              {storageError}
            </Typography>
          ) : null}
          {data.writingErrors.length ? (
            [...data.writingErrors]
              .reverse()
              .slice(0, 12)
              .map((entry) => (
                <View
                  key={entry.id}
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: colors.spacing * 2,
                    gap: colors.spacing,
                  }}
                >
                  <Typography variant="caption" tone="mutedForeground">
                    {formatUzbekDate(entry.date)}
                  </Typography>
                  <Typography variant="label">{entry.mistake}</Typography>
                  <Typography>{entry.correction}</Typography>
                </View>
              ))
          ) : (
            <Typography variant="caption" tone="mutedForeground">
              Xatolar va tuzatishlar shu yerda saqlanadi.
            </Typography>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
