import React, { useMemo, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@workspace/ielts-boost-design-system/components/native/button";
import { Card } from "@workspace/ielts-boost-design-system/components/native/card";
import { Input } from "@workspace/ielts-boost-design-system/components/native/input";
import { Typography } from "@workspace/ielts-boost-design-system/components/native/typography";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";
import { useAppData, type MockResult } from "@/context/AppDataContext";
import {
  formatUzbekDate,
  isValidDateKey,
  todayKey,
} from "@/lib/reading-plan";
import {
  mockSkills,
  parseBandScore,
  recentMocksForChart,
  summarizeMocks,
  type MockSkill,
} from "@/lib/mock-stats";

type DraftScores = Record<MockSkill, string>;
const emptyScores: DraftScores = {
  listening: "",
  reading: "",
  writing: "",
  speaking: "",
};

export default function MockJournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, ready, storageError, addMockResult } = useAppData();
  const [date, setDate] = useState(todayKey());
  const [scores, setScores] = useState<DraftScores>(emptyScores);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const sortedResults = useMemo(
    () =>
      [...data.mockResults].sort(
        (a, b) =>
          b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
      ),
    [data.mockResults],
  );
  const chartResults = useMemo(
    () => recentMocksForChart(data.mockResults),
    [data.mockResults],
  );
  const summary = useMemo(
    () => summarizeMocks(data.mockResults),
    [data.mockResults],
  );
  const bottomSpace = Platform.OS === "web" ? 34 : insets.bottom;

  const saveMock = async () => {
    setError("");
    setSavedMessage("");
    if (!isValidDateKey(date)) {
      setError("Sanani YYYY-MM-DD ko‘rinishida kiriting.");
      return;
    }
    const parsed = Object.fromEntries(
      mockSkills.map(({ key }) => [key, parseBandScore(scores[key])]),
    ) as Record<MockSkill, number | null>;
    const missing = mockSkills.filter(({ key }) => parsed[key] === null);
    if (missing.length) {
      setError(
        `Har bir bo‘lim uchun 0 dan 9 gacha, 0.5 qadamli band kiriting: ${missing
          .map(({ label }) => label)
          .join(", ")}.`,
      );
      return;
    }

    const result: Omit<MockResult, "id" | "createdAt"> = {
      date,
      listening: parsed.listening ?? 0,
      reading: parsed.reading ?? 0,
      writing: parsed.writing ?? 0,
      speaking: parsed.speaking ?? 0,
    };
    setBusy(true);
    const saved = await addMockResult(result);
    setBusy(false);
    if (!saved) {
      setError("Mock natijasini telefonga saqlab bo‘lmadi.");
      return;
    }
    setScores(emptyScores);
    setSavedMessage("Mock natijasi saqlandi.");
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography tone="mutedForeground">Mock jurnali yuklanmoqda…</Typography>
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
          <Typography variant="title">Mock jurnali</Typography>
          <Typography tone="mutedForeground">
            Har bir mock sanasi va to‘rtta bo‘lim bandini shu telefonda saqlang.
          </Typography>
        </View>

        <Card style={{ gap: colors.spacing * 3 }}>
          <Typography variant="heading">Mock natijasini kiritish</Typography>
          <View style={{ gap: colors.spacing }}>
            <Typography variant="label">Sana</Typography>
            <Input
              accessibilityLabel="Mock sanasi"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              testID="mock-date"
            />
          </View>
          {mockSkills.map(({ key, label }) => (
            <View key={key} style={{ gap: colors.spacing }}>
              <Typography variant="label">{label} bandi</Typography>
              <Input
                accessibilityLabel={`${label} bandi`}
                value={scores[key]}
                onChangeText={(value) =>
                  setScores((current) => ({ ...current, [key]: value }))
                }
                placeholder="Masalan: 6.5"
                keyboardType="decimal-pad"
                testID={`mock-score-${key}`}
              />
            </View>
          ))}
          <Typography variant="caption" tone="mutedForeground">
            IELTS yarim bandidan foydalaning: 0, 0.5, 1 … 9. Vergul yoki nuqta
            bilan yozish mumkin.
          </Typography>
          {error ? (
            <Typography variant="caption" tone="destructive">
              {error}
            </Typography>
          ) : null}
          {savedMessage ? (
            <Typography variant="caption" tone="accent">
              {savedMessage}
            </Typography>
          ) : null}
          {storageError ? (
            <Typography variant="caption" tone="destructive">
              {storageError}
            </Typography>
          ) : null}
          <Button
            disabled={busy}
            onPress={() => void saveMock()}
            testID="save-mock"
          >
            Mockni saqlash
          </Button>
        </Card>

        <Card style={{ gap: colors.spacing * 3 }}>
          <Typography variant="heading">Natijalar grafigi</Typography>
          {chartResults.length === 0 ? (
            <Typography tone="mutedForeground">
              Grafikni ko‘rish uchun avval mock natijasini kiriting.
            </Typography>
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: colors.spacing * 2,
                }}
              >
                {mockSkills.map(({ key, label, color }) => (
                  <View
                    key={key}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: colors.spacing,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors[color],
                      }}
                    />
                    <Typography variant="caption">{label}</Typography>
                  </View>
                ))}
              </View>
              <View
                accessibilityLabel="Oxirgi mock natijalari grafigi"
                style={{
                  height: 176,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  gap: colors.spacing,
                  paddingHorizontal: colors.spacing,
                  paddingTop: colors.spacing * 2,
                }}
              >
                {chartResults.map((result) => (
                  <View
                    key={result.id}
                    style={{
                      flex: 1,
                      height: "100%",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: 2,
                      }}
                    >
                      {mockSkills.map(({ key, color }) => (
                        <View
                          key={key}
                          accessibilityLabel={`${key}: ${result[key]}`}
                          style={{
                            width: 7,
                            height: `${Math.max(4, (result[key] / 9) * 100)}%`,
                            maxHeight: "100%",
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                            backgroundColor: colors[color],
                          }}
                        />
                      ))}
                    </View>
                    <Typography
                      variant="caption"
                      tone="mutedForeground"
                      style={{ fontSize: 10 }}
                    >
                      {result.date.slice(5)}
                    </Typography>
                  </View>
                ))}
              </View>
              <Typography variant="caption" tone="mutedForeground">
                Har mockda ustunlar Listening, Reading, Writing, Speaking tartibida.
                Yuqori balandlik — yuqori band; shkala 0–9.
              </Typography>
            </>
          )}
        </Card>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Eng zaif bo‘lim</Typography>
          {summary.averages ? (
            <>
              <Typography variant="title" tone="primary">
                {summary.weakest.map((key) =>
                  mockSkills.find((skill) => skill.key === key)?.label,
                ).join(", ")}
              </Typography>
              <Typography tone="mutedForeground">
                Saqlangan mocklar bo‘yicha o‘rtacha band:{" "}
                {summary.weakestAverage?.toFixed(1)}.
              </Typography>
            </>
          ) : (
            <Typography tone="mutedForeground">
              Hali mock natijasi yo‘q. Bo‘limlar o‘rtachasi kiritilgach ko‘rsatiladi.
            </Typography>
          )}
        </Card>

        <View style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Saqlangan mocklar</Typography>
          {sortedResults.length ? (
            sortedResults.map((result) => (
              <MockResultCard key={result.id} result={result} />
            ))
          ) : (
            <Card>
              <Typography tone="mutedForeground">
                Saqlangan natijalar shu yerda ko‘rinadi.
              </Typography>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MockResultCard({ result }: { result: MockResult }) {
  const colors = useColors();
  return (
    <Card style={{ gap: colors.spacing * 2 }}>
      <Typography variant="label">{formatUzbekDate(result.date)}</Typography>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: colors.spacing * 2 }}>
        {mockSkills.map(({ key, label }) => (
          <Typography
            key={key}
            variant="caption"
            style={{ minWidth: "46%", flexGrow: 1 }}
          >
            {label}: {result[key].toFixed(1)}
          </Typography>
        ))}
      </View>
    </Card>
  );
}
