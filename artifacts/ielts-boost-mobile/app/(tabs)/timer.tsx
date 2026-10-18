import React, { useEffect, useState } from "react";
import { Linking, Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@workspace/ielts-boost-design-system/components/native/badge";
import { Button } from "@workspace/ielts-boost-design-system/components/native/button";
import { Card } from "@workspace/ielts-boost-design-system/components/native/card";
import { Progress } from "@workspace/ielts-boost-design-system/components/native/progress";
import { Typography } from "@workspace/ielts-boost-design-system/components/native/typography";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";
import { useAppData } from "@/context/AppDataContext";
import {
  getTimerNotificationPermission,
  requestTimerNotificationPermission,
  scheduleTestNotification,
  type NotificationPermissionState,
} from "@/lib/timer-notifications";

const presets = [15, 20, 25, 40, 60];

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function TimerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    data,
    ready,
    storageError,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  } = useAppData();
  const [now, setNow] = useState(Date.now());
  const [selectedMinutes, setSelectedMinutes] = useState(20);
  const [permission, setPermission] =
    useState<NotificationPermissionState>("unsupported");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = data.activeTimer;
  const remainingMs = timer
    ? timer.pausedRemainingMs ?? Math.max(0, timer.endsAt - now)
    : 0;
  const progressValue = timer
    ? Math.max(0, timer.durationMs - remainingMs)
    : 0;
  const bottomSpace = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let alive = true;
    void getTimerNotificationPermission().then((state) => {
      if (alive) setPermission(state);
    });
    return () => {
      alive = false;
    };
  }, []);

  const start = async (label: string, minutes: number) => {
    setBusy(true);
    setMessage("");
    const result = await startTimer(label, minutes * 60);
    setBusy(false);
    if (!result.started) {
      setMessage("Taymerni boshlashdan oldin mavjud taymerni to‘xtating.");
      return;
    }
    setPermission(result.notification === "error" ? "denied" : result.notification);
    setMessage(
      result.notification === "granted"
        ? "Boshlanish va tugash vaqti telefonda saqlandi. Ovozli bildirishnoma rejalashtirildi."
        : result.notification === "unsupported"
          ? "Taymer ishlaydi, lekin brauzerda mahalliy ovozli bildirishnoma qo‘llanmaydi."
          : result.notification === "denied"
            ? "Taymer ishlaydi, ammo bildirishnoma ruxsati berilmadi. Telefon sozlamalaridan ruxsat bering."
        : "Taymer boshlandi, lekin bildirishnomani rejalashtirib bo‘lmadi."
    );
  };

  const requestPermission = async () => {
    setBusy(true);
    const state = await requestTimerNotificationPermission().catch(
      () => "denied" as const,
    );
    setPermission(state);
    setBusy(false);
    setMessage(
      state === "granted"
        ? "Bildirishnomalarga ruxsat berildi."
        : state === "unsupported"
          ? "Bu funksiya faqat telefondagi Expo ilovasida ishlaydi."
          : "Ruxsat berilmadi. Telefon sozlamalarida IELTS Boost bildirishnomalarini yoqing.",
    );
  };

  const testSound = async () => {
    setBusy(true);
    setMessage("");
    const state = await requestTimerNotificationPermission().catch(
      () => "denied" as const,
    );
    setPermission(state);
    if (state === "granted") {
      try {
        await scheduleTestNotification();
        setMessage("5 soniyadan keyin sinov bildirishnomasi keladi.");
      } catch {
        setMessage("Sinov bildirishnomasini rejalashtirib bo‘lmadi.");
      }
    } else {
      setMessage(
        state === "unsupported"
          ? "Sinov faqat telefondagi Expo ilovasida ishlaydi."
          : "Ovozli sinov uchun bildirishnomalarga ruxsat bering.",
      );
    }
    setBusy(false);
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography tone="mutedForeground">Taymer yuklanmoqda…</Typography>
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
          <Typography variant="title">Taymer</Typography>
          <Typography tone="mutedForeground">
            Vaqt telefoningizda hisoblanadi. Ilovadan chiqib boshqa ilovaga
            o‘tsangiz ham taymer davom etadi.
          </Typography>
        </View>

        <Card style={{ alignItems: "center", gap: colors.spacing * 3 }}>
          {timer ? (
            <>
              <Badge variant={timer.pausedRemainingMs !== null ? "default" : "success"}>
                {timer.pausedRemainingMs !== null ? "Pauzada" : "Ishlayapti"}
              </Badge>
              <Typography variant="heading" style={{ textAlign: "center" }}>
                {timer.label}
              </Typography>
              <Typography variant="timer" style={{ fontVariant: ["tabular-nums"] }}>
                {formatTime(remainingMs)}
              </Typography>
              <Progress
                value={progressValue}
                maximum={timer.durationMs}
                color="primary"
                style={{ width: "100%" }}
              />
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  gap: colors.spacing * 2,
                }}
              >
                {timer.pausedRemainingMs === null ? (
                  <Button
                    variant="secondary"
                    style={{ flex: 1 }}
                    disabled={busy}
                    onPress={() => void pauseTimer()}
                    testID="pause-timer"
                  >
                    Pauza
                  </Button>
                ) : (
                  <Button
                    style={{ flex: 1 }}
                    disabled={busy}
                    onPress={() => void resumeTimer()}
                    testID="resume-timer"
                  >
                    Davom ettirish
                  </Button>
                )}
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  disabled={busy}
                  onPress={() => void stopTimer()}
                  testID="stop-timer"
                >
                  To‘xtatish
                </Button>
              </View>
            </>
          ) : (
            <>
              <Typography variant="caption" tone="mutedForeground">
                {data.lastTimerResult
                  ? `${data.lastTimerResult.label} — vaqt tugadi`
                  : "Mashg‘ulot davomiyligini tanlang"}
              </Typography>
              <Typography variant="timer">00:00</Typography>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: colors.spacing * 2,
                }}
              >
                {presets.map((minutes) => (
                  <Button
                    key={minutes}
                    variant={selectedMinutes === minutes ? "primary" : "outline"}
                    size="sm"
                    onPress={() => setSelectedMinutes(minutes)}
                    testID={`timer-preset-${minutes}`}
                  >
                    {minutes} daq.
                  </Button>
                ))}
              </View>
              <Button
                style={{ width: "100%" }}
                disabled={busy}
                onPress={() => void start("Erkin mashq taymeri", selectedMinutes)}
                testID="start-timer"
              >
                Taymerni boshlash
              </Button>
            </>
          )}
        </Card>

        <Card style={{ gap: colors.spacing * 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: colors.spacing }}>
            <Typography variant="heading" style={{ flex: 1 }}>
              Ovozli bildirishnoma
            </Typography>
            <Badge variant={permission === "granted" ? "success" : "default"}>
              {permission === "granted"
                ? "Ruxsat bor"
                : permission === "unsupported"
                  ? "Mobil ilova kerak"
                  : "Tekshirish kerak"}
            </Badge>
          </View>
          <Typography variant="caption" tone="mutedForeground">
            Taymer boshlanganda tugash vaqti bo‘yicha telefon bildirishnomasi
            rejalashtiriladi. Bezovta qilmang rejimi, jim rejim yoki telefonning
            bildirishnoma sozlamalari ovozni o‘chirishi mumkin.
          </Typography>
          {permission !== "granted" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onPress={() => void requestPermission()}
              testID="request-notification-permission"
            >
              Bildirishnoma ruxsatini tekshirish
            </Button>
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: colors.spacing * 2 }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onPress={() => void testSound()}
              testID="test-notification-sound"
            >
              5 soniyalik tovush sinovi
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                if (Platform.OS === "web") {
                  setMessage("Telefon sozlamalarini mobil ilovadan oching.");
                } else {
                  void Linking.openSettings();
                }
              }}
              testID="open-device-settings"
            >
              Telefon sozlamalari
            </Button>
          </View>
        </Card>

        {data.activeTimer ? null : (
          <Typography variant="caption" tone="mutedForeground">
            Eslatma: bildirishnoma ovozining eshitilishi ruxsat, ovoz balandligi
            va telefonning Bezovta qilmang sozlamalariga bog‘liq.
          </Typography>
        )}
        {storageError ? (
          <Card accessibilityRole="alert">
            <Typography variant="caption" tone="destructive">
              {storageError}
            </Typography>
          </Card>
        ) : null}
        {message ? (
          <Card accessibilityRole="alert">
            <Typography variant="caption">{message}</Typography>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
