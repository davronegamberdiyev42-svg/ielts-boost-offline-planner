import React, { useEffect, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import type { Voice } from "expo-speech";
import { Button } from "@workspace/ielts-boost-design-system/components/native/button";
import { Card } from "@workspace/ielts-boost-design-system/components/native/card";
import { Input } from "@workspace/ielts-boost-design-system/components/native/input";
import { Typography } from "@workspace/ielts-boost-design-system/components/native/typography";
import { useColors } from "@workspace/ielts-boost-design-system/hooks/use-colors";
import { useAppData } from "@/context/AppDataContext";

export default function PronunciationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    data,
    ready,
    storageError,
    addPronunciationPhrase,
    removePronunciationPhrase,
  } = useAppData();
  const [draft, setDraft] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceMessage, setVoiceMessage] = useState("Telefon ovozlari tekshirilmoqda…");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const bottomSpace = Platform.OS === "web" ? 34 : insets.bottom;
  const englishVoice = voices.find((voice) =>
    voice.language.toLowerCase().startsWith("en"),
  );

  useEffect(() => {
    let alive = true;
    Speech.getAvailableVoicesAsync()
      .then((available) => {
        if (!alive) return;
        const english = available.filter((voice) =>
          voice.language.toLowerCase().startsWith("en"),
        );
        setVoices(english);
        setVoiceMessage(
          english.length
            ? `Telefondagi inglizcha ovoz: ${english[0].name}. Oflayn ishlashi uchun telefon sozlamalarida ovoz paketi o‘rnatilgan bo‘lishi kerak.`
            : "Telefonda inglizcha ovoz topilmadi. TTS sozlamalaridan inglizcha ovoz o‘rnating.",
        );
      })
      .catch(() => {
        if (alive) setVoiceMessage("Telefon ovozlarini tekshirib bo‘lmadi.");
      });
    return () => {
      alive = false;
      Speech.stop();
    };
  }, []);

  const savePhrase = async () => {
    const text = draft.trim();
    if (!text) {
      setSaveMessage("Avval so‘z yoki chunk kiriting.");
      return;
    }
    if (text.length > 240) {
      setSaveMessage("Matn 240 belgidan oshmasin.");
      return;
    }
    const saved = await addPronunciationPhrase(text);
    if (!saved) {
      setSaveMessage("Matnni telefonga saqlab bo‘lmadi.");
      return;
    }
    setDraft("");
    setSaveMessage("Matn telefonga saqlandi.");
  };

  const speak = (id: string, text: string) => {
    if (Platform.OS === "web") {
      setVoiceMessage("Ovoz chiqarish uchun ilovani telefonda oching.");
      return;
    }
    if (!englishVoice) {
      setVoiceMessage("Inglizcha ovoz topilmadi. Telefon sozlamalarini tekshiring.");
      return;
    }
    Speech.stop();
    setSpeakingId(id);
    Speech.speak(text, {
      voice: englishVoice.identifier,
      language: englishVoice.language,
      rate: 0.82,
      onDone: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null),
      onError: () => {
        setSpeakingId(null);
        setVoiceMessage("Telefon ovozi bu matnni o‘qiy olmadi.");
      },
    });
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Typography tone="mutedForeground">Talaffuz bo‘limi yuklanmoqda…</Typography>
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
          <Typography variant="title">Talaffuz</Typography>
          <Typography tone="mutedForeground">
            So‘z yoki chunk qo‘shing, yonidagi tugma telefon ovozida o‘qiydi.
          </Typography>
        </View>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Yangi so‘z yoki chunk</Typography>
          <Input
            accessibilityLabel="O‘qiladigan so‘z yoki chunk"
            value={draft}
            onChangeText={setDraft}
            placeholder="Masalan: a demanding schedule"
            autoCapitalize="none"
            testID="pronunciation-phrase"
          />
          {saveMessage ? (
            <Typography variant="caption" tone="mutedForeground">
              {saveMessage}
            </Typography>
          ) : null}
          <Button onPress={() => void savePhrase()} testID="save-pronunciation-phrase">
            Ro‘yxatga qo‘shish
          </Button>
        </Card>

        <Card style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Telefon ovozi</Typography>
          <Typography variant="caption" tone="mutedForeground">
            {voiceMessage}
          </Typography>
          <Typography variant="caption" tone="mutedForeground">
            Matn ilova ichida o‘qiladi. Internet talab qilinmaydi, agar telefonda
            oflayn inglizcha ovoz o‘rnatilgan bo‘lsa.
          </Typography>
          {Platform.OS === "web" ? (
            <Typography tone="mutedForeground">
              Ovoz chiqarishni tekshirish uchun ilovani telefonda oching.
            </Typography>
          ) : null}
        </Card>

        <View style={{ gap: colors.spacing * 2 }}>
          <Typography variant="heading">Saqlangan so‘zlar va chunklar</Typography>
          {data.pronunciationPhrases.length ? (
            [...data.pronunciationPhrases]
              .reverse()
              .map((phrase) => (
                <Card
                  key={phrase.id}
                  style={{
                    gap: colors.spacing * 2,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography style={{ flex: 1 }}>{phrase.text}</Typography>
                  <Button
                    variant="outline"
                    disabled={!englishVoice || Platform.OS === "web"}
                    onPress={() =>
                      speakingId === phrase.id
                        ? Speech.stop()
                        : speak(phrase.id, phrase.text)
                    }
                    accessibilityLabel={`${phrase.text} ni ovoz chiqarib o‘qish`}
                  >
                    {speakingId === phrase.id ? "To‘xtatish" : "Tinglash"}
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => void removePronunciationPhrase(phrase.id)}
                    accessibilityLabel={`${phrase.text} ni o‘chirish`}
                  >
                    O‘chirish
                  </Button>
                </Card>
              ))
          ) : (
            <Card>
              <Typography tone="mutedForeground">
                Saqlangan so‘z va chunklar hali yo‘q.
              </Typography>
            </Card>
          )}
        </View>

        {storageError ? (
          <Typography variant="caption" tone="destructive">
            {storageError}
          </Typography>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
