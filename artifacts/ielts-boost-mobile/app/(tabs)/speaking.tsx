import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppState,
  Linking,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from "expo-audio";
import { Button } from "@workspace/ielts-boost-design-system/components/native/button";
import { Card } from "@workspace/ielts-boost-design-system/components/native/card";
import { Input } from "@workspace/ielts-boost-design-system/components/native/input";
import { Typography } from "@workspace/ielts-boost-design-system/components/native/typography";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";
import { useAppData, type SpeakingPractice } from "@/context/AppDataContext";
import { speakingBank } from "@/lib/speaking-bank";
import { parseBandScore } from "@/lib/mock-stats";

type Part = 1 | 2 | 3;
type ScoreKey = "fluency" | "vocabulary" | "grammar" | "pronunciation";
type Scores = Record<ScoreKey, string>;
type MicPermission = { granted: boolean; canAskAgain: boolean };

const emptyScores: Scores = {
  fluency: "",
  vocabulary: "",
  grammar: "",
  pronunciation: "",
};
const scoreFields: { key: ScoreKey; label: string }[] = [
  { key: "fluency", label: "Ravonlik va izchillik" },
  { key: "vocabulary", label: "Lug‘at boyligi" },
  { key: "grammar", label: "Grammatika" },
  { key: "pronunciation", label: "Talaffuz" },
];
const p2Label = (id: string) => `Part 2 — ${id}`;
const p2TotalMs = 180_000;
const p2PrepMs = 60_000;

function formatClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(
    totalSeconds % 60,
  ).padStart(2, "0")}`;
}

export default function SpeakingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    data,
    ready,
    storageError,
    startTimer,
    pauseTimer,
    resumeTimer,
    addSpeakingPractice,
  } = useAppData();
  const [part, setPart] = useState<Part>(1);
  const [topicId, setTopicId] = useState<string>(speakingBank[0].id);
  const [part1QuestionIndex, setPart1QuestionIndex] = useState(0);
  const [cueCardIndex, setCueCardIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [timerMessage, setTimerMessage] = useState("");
  const [micMessage, setMicMessage] = useState("");
  const [micPermission, setMicPermission] = useState<MicPermission | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [scores, setScores] = useState<Scores>(emptyScores);
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingPlayback, setPendingPlayback] = useState(false);
  const bottomSpace = Platform.OS === "web" ? 34 : insets.bottom;

  const recorder = useAudioRecorder(
    useMemo(
      () => ({ ...RecordingPresets.HIGH_QUALITY, directory: "document" as const }),
      [],
    ),
  );
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const selectedTopic =
    speakingBank.find((entry) => entry.id === topicId) ?? speakingBank[0];
  const activeP2Entry = speakingBank.find(
    (entry) => data.activeTimer?.label === p2Label(entry.id),
  );
  const selectedCue = speakingBank[cueCardIndex] ?? speakingBank[0];
  const visibleCue = activeP2Entry ?? selectedCue;
  const visiblePart = activeP2Entry ? 2 : part;
  const activeP2Timer = activeP2Entry ? data.activeTimer : null;
  const selectedP2Finished =
    data.lastTimerResult?.label === p2Label(selectedCue.id);
  const p2Elapsed = activeP2Timer
    ? activeP2Timer.pausedRemainingMs !== null
      ? activeP2Timer.durationMs - activeP2Timer.pausedRemainingMs
      : Math.max(0, now - activeP2Timer.startedAt)
    : selectedP2Finished
      ? p2TotalMs
      : 0;
  const p2Phase = activeP2Timer
    ? activeP2Timer.pausedRemainingMs !== null
      ? "paused"
      : p2Elapsed < p2PrepMs
        ? "preparation"
        : "speaking"
    : selectedP2Finished
      ? "finished"
      : "idle";
  const p2Remaining =
    p2Phase === "preparation"
      ? p2PrepMs - p2Elapsed
      : p2Phase === "speaking"
        ? p2TotalMs - p2Elapsed
        : 0;
  const part1Prompt = selectedTopic.part1[part1QuestionIndex] ?? selectedTopic.part1[0];
  const prompt =
    visiblePart === 1
      ? part1Prompt
      : visiblePart === 2
        ? visibleCue.part2
        : selectedTopic.part3;
  const promptTopic = visiblePart === 2 ? visibleCue.topic : selectedTopic.topic;
  const otherTimerIsActive =
    Boolean(data.activeTimer) && !activeP2Entry;

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 500);
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });
    return () => {
      clearInterval(interval);
      appState.remove();
    };
  }, []);

  useEffect(() => {
    if (pendingPlayback && playerStatus.isLoaded) {
      player.play();
      setPendingPlayback(false);
    }
  }, [pendingPlayback, player, playerStatus.isLoaded]);

  const stopRecording = useCallback(async () => {
    if (!recorder.isRecording) return;
    try {
      await recorder.stop();
      setRecordedUri(recorder.uri);
      setRecording(false);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    } catch {
      setMicMessage("Ovoz yozuvini yakunlab bo‘lmadi.");
      setRecording(false);
    }
  }, [recorder]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" && recorder.isRecording) {
        setMicMessage("Ilovadan chiqilgani uchun yozuv to‘xtatildi.");
        void stopRecording();
      }
    });
    return () => subscription.remove();
  }, [recorder, stopRecording]);

  useEffect(() => {
    if (p2Phase === "finished" && recorder.isRecording) {
      void stopRecording();
    }
  }, [p2Phase, recorder, stopRecording]);

  const startP2Timer = async () => {
    setTimerMessage("");
    const result = await startTimer(p2Label(selectedCue.id), 180);
    if (!result.started) {
      setTimerMessage(
        data.activeTimer
          ? "Boshqa taymer ishlayapti. Avval Taymer bo‘limida uni yakunlang."
          : "Part 2 taymerini boshlab bo‘lmadi.",
      );
      return;
    }
    setTimerMessage(
      result.notification === "granted"
        ? "Taymer boshlandi: 1 daqiqa tayyorgarlik, so‘ng 2 daqiqa gapirish."
        : "Taymer boshlandi. Bildirishnoma ruxsatini telefon sozlamalaridan yoqing.",
    );
  };

  const startRecording = async () => {
    setMicMessage("");
    if (Platform.OS === "web") {
      setMicMessage("Ovoz yozish uchun ilovani telefonda oching.");
      return;
    }
    try {
      const permission = await requestRecordingPermissionsAsync();
      setMicPermission(permission);
      if (!permission.granted) {
        setMicMessage("Ovoz yozish uchun mikrofonga ruxsat bering.");
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordedUri(null);
      setRecording(true);
    } catch {
      setMicMessage("Mikrofonni ishga tushirib bo‘lmadi. Telefon sozlamalarini tekshiring.");
    }
  };

  const playUri = (uri: string) => {
    player.replace(uri);
    setPendingPlayback(true);
  };

  const saveAssessment = async () => {
    setSaveMessage("");
    setMicMessage("");
    const parsed = Object.fromEntries(
      scoreFields.map(({ key }) => [key, parseBandScore(scores[key])]),
    ) as Record<ScoreKey, number | null>;
    const missing = scoreFields.filter(({ key }) => parsed[key] === null);
    if (missing.length) {
      setSaveMessage(
        `0–9 oralig‘ida, 0.5 qadam bilan baholang: ${missing
          .map(({ label }) => label)
          .join(", ")}.`,
      );
      return;
    }
    const practice: Omit<SpeakingPractice, "id" | "createdAt"> = {
      part: visiblePart,
      topic: promptTopic,
      prompt,
      audioUri: recordedUri,
      fluency: parsed.fluency ?? 0,
      vocabulary: parsed.vocabulary ?? 0,
      grammar: parsed.grammar ?? 0,
      pronunciation: parsed.pronunciation ?? 0,
    };
    setSaving(true);
    const saved = await addSpeakingPractice(practice);
    setSaving(false);
    if (!saved) {
      setSaveMessage("O‘z-o‘zini baholash telefoningizga saqlanmadi.");
      return;
    }
    setScores(emptyScores);
    setRecordedUri(null);
    setSaveMessage("Baholash va yozuv telefonga saqlandi.");
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography tone="mutedForeground">Speaking mashqi yuklanmoqda…</Typography>
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
          <Typography variant="title">Speaking mashqi</Typography>
          <Typography tone="mutedForeground">
            Boshqaruv o‘zbekcha, IELTS savollari esa ingliz tilida. Javobingizni yozib,
            o‘zingiz baholang.
          </Typography>
        </View>

        <View style={{ flexDirection: "row", gap: colors.spacing }}>
          {([1, 2, 3] as const).map((value) => (
            <Button
              key={value}
              variant={part === value ? undefined : "outline"}
              onPress={() => setPart(value)}
              testID={`speaking-part-${value}`}
            >
              Part {value}
            </Button>
          ))}
        </View>

        {part !== 2 ? (
          <Card style={{ gap: colors.spacing * 2 }}>
            <Typography variant="label">Mavzu</Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: colors.spacing }}>
                {speakingBank.map((entry) => (
                  <Button
                    key={entry.id}
                    variant={topicId === entry.id ? undefined : "outline"}
                    onPress={() => {
                      setTopicId(entry.id);
                      setPart1QuestionIndex(0);
                    }}
                  >
                    {entry.topic}
                  </Button>
                ))}
              </View>
            </ScrollView>
          </Card>
        ) : (
          <Card style={{ gap: colors.spacing * 2 }}>
            <Typography variant="label">Cue card</Typography>
            <Typography variant="caption" tone="mutedForeground">
              Kartalar ilovadagi Speaking manbasidan olingan.
            </Typography>
            <Typography variant="heading">
              {cueCardIndex + 1} / {speakingBank.length}
            </Typography>
            <View style={{ flexDirection: "row", gap: colors.spacing }}>
              <Button
                disabled={Boolean(activeP2Entry)}
                variant="outline"
                onPress={() =>
                  setCueCardIndex(
                    (current) => (current - 1 + speakingBank.length) % speakingBank.length,
                  )
                }
              >
                Oldingi karta
              </Button>
              <Button
                disabled={Boolean(activeP2Entry)}
                variant="outline"
                onPress={() =>
                  setCueCardIndex((current) => (current + 1) % speakingBank.length)
                }
              >
                Keyingi karta
              </Button>
            </View>
          </Card>
        )}

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="caption" tone="mutedForeground">
            {visiblePart === 1
              ? `Part 1 · ${selectedTopic.topic}`
              : visiblePart === 2
                ? `Part 2 · ${visibleCue.topic}`
                : `Part 3 · ${selectedTopic.topic}`}
          </Typography>
          <Typography variant="heading">{prompt}</Typography>
          {visiblePart === 2 ? (
            <Typography tone="mutedForeground">
              Tayyorgarlikda g‘oyalarni yozib oling. Gapirganda qayerda bo‘lganini,
              nima bo‘lganini va nima uchun muhimligini ayting.
            </Typography>
          ) : null}
          {visiblePart === 1 ? (
            <View style={{ gap: colors.spacing }}>
              {selectedTopic.part1.map((question, index) => (
                <Button
                  key={question}
                  variant={part1QuestionIndex === index ? undefined : "outline"}
                  onPress={() => setPart1QuestionIndex(index)}
                >
                  {question}
                </Button>
              ))}
            </View>
          ) : null}
        </Card>

        {part === 2 || activeP2Entry ? (
          <Card style={{ gap: colors.spacing * 2 }}>
            <Typography variant="heading">1 daqiqa tayyorgarlik + 2 daqiqa gapirish</Typography>
            {p2Phase === "idle" ? (
              <>
                <Typography tone="mutedForeground">
                  Taymer tugash vaqtini saqlaydi. Bildirishnoma ovozi telefon ruxsatlari va
                  Bezovta qilmang sozlamasiga bog‘liq.
                </Typography>
                <Button
                  disabled={otherTimerIsActive}
                  onPress={() => void startP2Timer()}
                  testID="start-part2-timer"
                >
                  Mashq taymerini boshlash
                </Button>
              </>
            ) : p2Phase === "preparation" ? (
              <>
                <Typography variant="label">Tayyorgarlik</Typography>
                <Typography variant="title">{formatClock(p2Remaining)}</Typography>
                <Typography tone="mutedForeground">
                  1 daqiqa reja tuzing. So‘ng taymer gapirish bosqichiga o‘tadi.
                </Typography>
                <Button variant="outline" onPress={() => void pauseTimer()}>
                  Taymerni pauza qilish
                </Button>
              </>
            ) : p2Phase === "speaking" ? (
              <>
                <Typography variant="label">Gapirish</Typography>
                <Typography variant="title">{formatClock(p2Remaining)}</Typography>
                <Typography tone="mutedForeground">
                  2 daqiqa gapiring. Yozuvni boshlash uchun pastdagi mikrofon tugmasini bosing.
                </Typography>
                <Button variant="outline" onPress={() => void pauseTimer()}>
                  Taymerni pauza qilish
                </Button>
              </>
            ) : p2Phase === "paused" ? (
              <>
                <Typography variant="label">Taymer pauzada</Typography>
                <Button onPress={() => void resumeTimer()}>
                  Davom ettirish
                </Button>
              </>
            ) : (
              <Typography variant="label">Part 2 vaqti tugadi.</Typography>
            )}
            {timerMessage ? (
              <Typography variant="caption" tone="mutedForeground">
                {timerMessage}
              </Typography>
            ) : null}
          </Card>
        ) : null}

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Ovoz yozuvi</Typography>
          <Typography variant="caption" tone="mutedForeground">
            Yozuv telefonda saqlanadi. Yozayotgan paytda ilovadan chiqsangiz, yozuv to‘xtaydi.
          </Typography>
          {Platform.OS === "web" ? (
            <Typography tone="mutedForeground">
              Ovoz yozish uchun ilovani telefonda oching.
            </Typography>
          ) : recording ? (
            <Button variant="outline" onPress={() => void stopRecording()}>
              Yozishni to‘xtatish
            </Button>
          ) : (
            <Button
              disabled={visiblePart === 2 && p2Phase !== "speaking"}
              onPress={() => void startRecording()}
              testID="start-speaking-recording"
            >
              Mikrofon bilan yozishni boshlash
            </Button>
          )}
          {micMessage ? (
            <Typography variant="caption" tone="destructive">
              {micMessage}
            </Typography>
          ) : null}
          {micPermission?.granted === false && !micPermission.canAskAgain ? (
            <Button
              variant="outline"
              onPress={() =>
                void Linking.openSettings().catch(() =>
                  setMicMessage("Telefon sozlamalarini ochib bo‘lmadi."),
                )
              }
            >
              Telefon sozlamalarini ochish
            </Button>
          ) : null}
          {recordedUri ? (
            <Button
              variant="outline"
              onPress={() => {
                if (playerStatus.playing) {
                  player.pause();
                } else {
                  playUri(recordedUri);
                }
              }}
            >
              {playerStatus.playing ? "Yozuvni to‘xtatib eshitish" : "Yozuvni tinglash"}
            </Button>
          ) : null}
        </Card>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">O‘zimni baholayman</Typography>
          {scoreFields.map(({ key, label }) => (
            <View key={key} style={{ gap: colors.spacing }}>
              <Typography variant="label">{label}</Typography>
              <Input
                accessibilityLabel={`${label} bandi`}
                value={scores[key]}
                onChangeText={(value) =>
                  setScores((current) => ({ ...current, [key]: value }))
                }
                placeholder="0–9, masalan 6.5"
                keyboardType="decimal-pad"
              />
            </View>
          ))}
          <Typography variant="caption" tone="mutedForeground">
            Har bir mezonga 0 dan 9 gacha, 0.5 qadam bilan ball qo‘ying.
          </Typography>
          {saveMessage ? (
            <Typography variant="caption" tone="mutedForeground">
              {saveMessage}
            </Typography>
          ) : null}
          {storageError ? (
            <Typography variant="caption" tone="destructive">
              {storageError}
            </Typography>
          ) : null}
          <Button
            disabled={saving || recording}
            onPress={() => void saveAssessment()}
            testID="save-speaking-assessment"
          >
            Baholashni saqlash
          </Button>
        </Card>

        <View style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Saqlangan mashqlar</Typography>
          {data.speakingPractices.length ? (
            [...data.speakingPractices]
              .reverse()
              .slice(0, 10)
              .map((practice) => (
                <SpeakingPracticeCard
                  key={practice.id}
                  practice={practice}
                  playAudio={playUri}
                  isPlaying={playerStatus.playing}
                  pauseAudio={() => player.pause()}
                />
              ))
          ) : (
            <Card>
              <Typography tone="mutedForeground">
                Baholangan javoblaringiz shu yerda saqlanadi.
              </Typography>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpeakingPracticeCard({
  practice,
  playAudio,
  isPlaying,
  pauseAudio,
}: {
  practice: SpeakingPractice;
  playAudio: (uri: string) => void;
  isPlaying: boolean;
  pauseAudio: () => void;
}) {
  const colors = useColors();
  const date = new Date(practice.createdAt).toLocaleDateString("uz-UZ");
  return (
    <Card style={{ gap: colors.spacing * 2 }}>
      <Typography variant="caption" tone="mutedForeground">
        Part {practice.part} · {practice.topic} · {date}
      </Typography>
      <Typography variant="label">{practice.prompt}</Typography>
      <Typography variant="caption">
        Ravonlik {practice.fluency.toFixed(1)} · Lug‘at {practice.vocabulary.toFixed(1)} ·
        Grammatika {practice.grammar.toFixed(1)} · Talaffuz{" "}
        {practice.pronunciation.toFixed(1)}
      </Typography>
      {practice.audioUri ? (
        <Button
          variant="outline"
          onPress={() =>
            isPlaying ? pauseAudio() : playAudio(practice.audioUri as string)
          }
        >
          {isPlaying ? "Yozuvni pauza qilish" : "Yozuvni tinglash"}
        </Button>
      ) : (
        <Typography variant="caption" tone="mutedForeground">
          Audio yozuv qo‘shilmagan.
        </Typography>
      )}
    </Card>
  );
}
