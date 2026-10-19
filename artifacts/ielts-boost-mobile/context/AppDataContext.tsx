import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState, Platform } from "react-native";
import {
  cancelTimerNotification,
  requestTimerNotificationPermission,
  scheduleTimerNotification,
  type NotificationPermissionState,
} from "@/lib/timer-notifications";

const STORAGE_KEY = "ielts-boost.offline.v1";

export type ReadingDayRecord = {
  completedBlockIds: string[];
  note: string;
  metrics: Record<string, string>;
};

export type ActiveTimer = {
  id: string;
  label: string;
  durationMs: number;
  startedAt: number;
  endsAt: number;
  pausedRemainingMs: number | null;
  notificationId: string | null;
};

export type TimerResult = {
  label: string;
  startedAt: number;
  finishedAt: number;
};

export type MockResult = {
  id: string;
  date: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  createdAt: number;
};

export type SpeakingPractice = {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  prompt: string;
  audioUri: string | null;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  createdAt: number;
};

export type WritingTaskKey = "task1" | "task2";
export type WritingErrorRecord = {
  id: string;
  date: string;
  mistake: string;
  correction: string;
  createdAt: number;
};

export type PronunciationPhrase = {
  id: string;
  text: string;
  createdAt: number;
};

export type LocalAppData = {
  version: 1;
  planStartDate: string | null;
  readingDays: Record<string, ReadingDayRecord>;
  shadowingLinks: Record<string, string>;
  mockResults: MockResult[];
  speakingPractices: SpeakingPractice[];
  writingDrafts: Record<WritingTaskKey, string>;
  writingChecklist: Record<WritingTaskKey, Record<string, boolean>>;
  writingErrors: WritingErrorRecord[];
  pronunciationPhrases: PronunciationPhrase[];
  activeTimer: ActiveTimer | null;
  lastTimerResult: TimerResult | null;
};

type TimerStartResult = {
  started: boolean;
  notification: NotificationPermissionState | "error";
};

type AppDataContextValue = {
  data: LocalAppData;
  ready: boolean;
  storageError: string | null;
  setPlanStartDate: (date: string) => Promise<boolean>;
  toggleReadingBlock: (date: string, blockId: string) => Promise<boolean>;
  setReadingNote: (date: string, note: string) => Promise<boolean>;
  setReadingMetric: (
    date: string,
    metric: string,
    value: string,
  ) => Promise<boolean>;
  setShadowingLink: (date: string, link: string) => Promise<boolean>;
  addMockResult: (
    result: Omit<MockResult, "id" | "createdAt">,
  ) => Promise<boolean>;
  addSpeakingPractice: (
    practice: Omit<SpeakingPractice, "id" | "createdAt">,
  ) => Promise<boolean>;
  setWritingDraft: (task: WritingTaskKey, text: string) => Promise<boolean>;
  toggleWritingChecklist: (
    task: WritingTaskKey,
    item: string,
  ) => Promise<boolean>;
  addWritingError: (
    entry: Omit<WritingErrorRecord, "id" | "createdAt">,
  ) => Promise<boolean>;
  addPronunciationPhrase: (text: string) => Promise<boolean>;
  removePronunciationPhrase: (id: string) => Promise<boolean>;
  startTimer: (label: string, durationSeconds: number) => Promise<TimerStartResult>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<TimerStartResult>;
  stopTimer: () => Promise<void>;
};

const initialData: LocalAppData = {
  version: 1,
  planStartDate: null,
  readingDays: {},
  shadowingLinks: {},
  mockResults: [],
  speakingPractices: [],
  writingDrafts: { task1: "", task2: "" },
  writingChecklist: { task1: {}, task2: {} },
  writingErrors: [],
  pronunciationPhrases: [],
  activeTimer: null,
  lastTimerResult: null,
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function emptyReadingDay(): ReadingDayRecord {
  return { completedBlockIds: [], note: "", metrics: {} };
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<LocalAppData>(initialData);
  const dataRef = useRef<LocalAppData>(initialData);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const finishingTimer = useRef(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (
            !parsed ||
            typeof parsed !== "object" ||
            !("version" in parsed) ||
            parsed.version !== 1 ||
            !("readingDays" in parsed) ||
            !("activeTimer" in parsed)
          ) {
            throw new Error("Telefondagi saqlangan ma'lumot formati noto'g'ri.");
          }
          const loaded = { ...initialData, ...parsed } as LocalAppData;
          dataRef.current = loaded;
          setData(loaded);
        }
        setReady(true);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setStorageError(
          error instanceof Error
            ? `Telefondagi ma'lumotni o'qib bo'lmadi: ${error.message}`
            : "Telefondagi ma'lumotni o'qib bo'lmadi.",
        );
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback(async (next: LocalAppData): Promise<boolean> => {
    dataRef.current = next;
    setData(next);
    const serialized = JSON.stringify(next);
    const write = writeQueue.current
      .catch(() => undefined)
      .then(async () => {
        await AsyncStorage.setItem(STORAGE_KEY, serialized);
      });
    writeQueue.current = write;
    try {
      await write;
      setStorageError(null);
      return true;
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Ma'lumot telefonga saqlanmadi: ${error.message}`
          : "Ma'lumot telefonga saqlanmadi.",
      );
      return false;
    }
  }, []);

  const setPlanStartDate = useCallback(
    (date: string) =>
      persist({ ...dataRef.current, planStartDate: date }),
    [persist],
  );

  const toggleReadingBlock = useCallback(
    (date: string, blockId: string) => {
      const current = dataRef.current;
      const day = current.readingDays[date] ?? emptyReadingDay();
      const hasBlock = day.completedBlockIds.includes(blockId);
      const completedBlockIds = hasBlock
        ? day.completedBlockIds.filter((id) => id !== blockId)
        : [...day.completedBlockIds, blockId];
      return persist({
        ...current,
        readingDays: {
          ...current.readingDays,
          [date]: { ...day, completedBlockIds },
        },
      });
    },
    [persist],
  );

  const setReadingNote = useCallback(
    (date: string, note: string) => {
      const current = dataRef.current;
      const day = current.readingDays[date] ?? emptyReadingDay();
      return persist({
        ...current,
        readingDays: {
          ...current.readingDays,
          [date]: { ...day, note },
        },
      });
    },
    [persist],
  );

  const setReadingMetric = useCallback(
    (date: string, metric: string, value: string) => {
      const current = dataRef.current;
      const day = current.readingDays[date] ?? emptyReadingDay();
      return persist({
        ...current,
        readingDays: {
          ...current.readingDays,
          [date]: {
            ...day,
            metrics: { ...day.metrics, [metric]: value },
          },
        },
      });
    },
    [persist],
  );

  const setShadowingLink = useCallback(
    (date: string, link: string) =>
      persist({
        ...dataRef.current,
        shadowingLinks: { ...dataRef.current.shadowingLinks, [date]: link },
      }),
    [persist],
  );

  const addMockResult = useCallback(
    (result: Omit<MockResult, "id" | "createdAt">) => {
      const createdAt = Date.now();
      const entry: MockResult = {
        ...result,
        id: `${createdAt}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt,
      };
      return persist({
        ...dataRef.current,
        mockResults: [...dataRef.current.mockResults, entry],
      });
    },
    [persist],
  );

  const addSpeakingPractice = useCallback(
    (practice: Omit<SpeakingPractice, "id" | "createdAt">) => {
      const createdAt = Date.now();
      const entry: SpeakingPractice = {
        ...practice,
        id: `${createdAt}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt,
      };
      return persist({
        ...dataRef.current,
        speakingPractices: [...dataRef.current.speakingPractices, entry],
      });
    },
    [persist],
  );

  const setWritingDraft = useCallback(
    (task: WritingTaskKey, text: string) =>
      persist({
        ...dataRef.current,
        writingDrafts: { ...dataRef.current.writingDrafts, [task]: text },
      }),
    [persist],
  );

  const toggleWritingChecklist = useCallback(
    (task: WritingTaskKey, item: string) => {
      const checklist = dataRef.current.writingChecklist[task] ?? {};
      return persist({
        ...dataRef.current,
        writingChecklist: {
          ...dataRef.current.writingChecklist,
          [task]: { ...checklist, [item]: !checklist[item] },
        },
      });
    },
    [persist],
  );

  const addWritingError = useCallback(
    (entry: Omit<WritingErrorRecord, "id" | "createdAt">) => {
      const createdAt = Date.now();
      const saved: WritingErrorRecord = {
        ...entry,
        id: `${createdAt}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt,
      };
      return persist({
        ...dataRef.current,
        writingErrors: [...dataRef.current.writingErrors, saved],
      });
    },
    [persist],
  );

  const addPronunciationPhrase = useCallback(
    (text: string) => {
      const phrase: PronunciationPhrase = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text,
        createdAt: Date.now(),
      };
      return persist({
        ...dataRef.current,
        pronunciationPhrases: [...dataRef.current.pronunciationPhrases, phrase],
      });
    },
    [persist],
  );

  const removePronunciationPhrase = useCallback(
    (id: string) =>
      persist({
        ...dataRef.current,
        pronunciationPhrases: dataRef.current.pronunciationPhrases.filter(
          (phrase) => phrase.id !== id,
        ),
      }),
    [persist],
  );

  const startTimer = useCallback(
    async (label: string, durationSeconds: number): Promise<TimerStartResult> => {
      if (
        dataRef.current.activeTimer ||
        !Number.isFinite(durationSeconds) ||
        durationSeconds <= 0
      ) {
        return { started: false, notification: "error" };
      }
      const notification = await requestTimerNotificationPermission().catch(
        () => "denied" as const,
      );
      const startedAt = Date.now();
      const timer: ActiveTimer = {
        id: `${startedAt}-${Math.random().toString(36).slice(2, 9)}`,
        label,
        durationMs: durationSeconds * 1000,
        startedAt,
        endsAt: startedAt + durationSeconds * 1000,
        pausedRemainingMs: null,
        notificationId: null,
      };
      const saved = await persist({
        ...dataRef.current,
        activeTimer: timer,
        lastTimerResult: null,
      });
      if (!saved) return { started: false, notification: "error" };
      if (notification !== "granted") {
        return { started: true, notification };
      }
      try {
        const notificationId = await scheduleTimerNotification(
          timer.id,
          timer.label,
          timer.endsAt,
        );
        const updated = { ...timer, notificationId };
        const notificationSaved = await persist({
          ...dataRef.current,
          activeTimer: updated,
        });
        if (!notificationSaved) {
          await cancelTimerNotification(notificationId).catch(() => undefined);
          return { started: true, notification: "error" };
        }
        return { started: true, notification: "granted" };
      } catch {
        return { started: true, notification: "error" };
      }
    },
    [persist],
  );

  const stopTimer = useCallback(async () => {
    const current = dataRef.current;
    if (!current.activeTimer) return;
    await cancelTimerNotification(current.activeTimer.notificationId).catch(
      () => undefined,
    );
    await persist({ ...current, activeTimer: null });
  }, [persist]);

  const finishTimer = useCallback(
    async (force = false) => {
      const current = dataRef.current;
      const timer = current.activeTimer;
      if (
        !timer ||
        timer.pausedRemainingMs !== null ||
        (!force && timer.endsAt > Date.now()) ||
        finishingTimer.current
      ) {
        return;
      }
      finishingTimer.current = true;
      await cancelTimerNotification(timer.notificationId).catch(
        () => undefined,
      );
      const saved = await persist({
        ...dataRef.current,
        activeTimer: null,
        lastTimerResult: {
          label: timer.label,
          startedAt: timer.startedAt,
          finishedAt: Date.now(),
        },
      });
      finishingTimer.current = false;
      if (saved && Platform.OS !== "web") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
      }
    },
    [persist],
  );

  const pauseTimer = useCallback(async () => {
    const timer = dataRef.current.activeTimer;
    if (!timer || timer.pausedRemainingMs !== null) return;
    const pausedRemainingMs = Math.max(0, timer.endsAt - Date.now());
    if (pausedRemainingMs <= 0) {
      await finishTimer(true);
      return;
    }
    await cancelTimerNotification(timer.notificationId).catch(
      () => undefined,
    );
    await persist({
      ...dataRef.current,
      activeTimer: { ...timer, pausedRemainingMs, notificationId: null },
    });
  }, [finishTimer, persist]);

  const resumeTimer = useCallback(async (): Promise<TimerStartResult> => {
    const timer = dataRef.current.activeTimer;
    if (!timer || timer.pausedRemainingMs === null) {
      return { started: false, notification: "error" };
    }
    const notification = await requestTimerNotificationPermission().catch(
      () => "denied" as const,
    );
    const resumed: ActiveTimer = {
      ...timer,
      startedAt:
        Date.now() - (timer.durationMs - timer.pausedRemainingMs),
      endsAt: Date.now() + timer.pausedRemainingMs,
      pausedRemainingMs: null,
      notificationId: null,
    };
    const saved = await persist({
      ...dataRef.current,
      activeTimer: resumed,
    });
    if (!saved || notification !== "granted") {
      return { started: saved, notification: saved ? notification : "error" };
    }
    try {
      const notificationId = await scheduleTimerNotification(
        resumed.id,
        resumed.label,
        resumed.endsAt,
      );
      const notificationSaved = await persist({
        ...dataRef.current,
        activeTimer: { ...resumed, notificationId },
      });
      if (!notificationSaved) {
        await cancelTimerNotification(notificationId).catch(() => undefined);
        return { started: true, notification: "error" };
      }
      return { started: true, notification: "granted" };
    } catch {
      return { started: true, notification: "error" };
    }
  }, [persist]);

  useEffect(() => {
    if (!ready) return;
    const checkExpiry = () => {
      const timer = dataRef.current.activeTimer;
      if (
        timer &&
        timer.pausedRemainingMs === null &&
        timer.endsAt <= Date.now()
      ) {
        void finishTimer(true);
      }
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") checkExpiry();
    });
    const notificationSubscription =
      Platform.OS === "web"
        ? null
        : Notifications.addNotificationReceivedListener((notification) => {
            const timerId = notification.request.content.data?.timerId;
            if (
              typeof timerId === "string" &&
              timerId === dataRef.current.activeTimer?.id
            ) {
              void finishTimer(true);
            }
          });
    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
      notificationSubscription?.remove();
    };
  }, [finishTimer, ready]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      ready,
      storageError,
      setPlanStartDate,
      toggleReadingBlock,
      setReadingNote,
      setReadingMetric,
      setShadowingLink,
      addMockResult,
      addSpeakingPractice,
      setWritingDraft,
      toggleWritingChecklist,
      addWritingError,
      addPronunciationPhrase,
      removePronunciationPhrase,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
    }),
    [
      data,
      ready,
      storageError,
      setPlanStartDate,
      toggleReadingBlock,
      setReadingNote,
      setReadingMetric,
      setShadowingLink,
      addMockResult,
      addSpeakingPractice,
      setWritingDraft,
      toggleWritingChecklist,
      addWritingError,
      addPronunciationPhrase,
      removePronunciationPhrase,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error("useAppData faqat AppDataProvider ichida ishlatiladi.");
  }
  return value;
}
