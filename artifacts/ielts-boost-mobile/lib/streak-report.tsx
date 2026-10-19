import type { ReadingDayRecord } from "@/context/AppDataContext";

export type WeeklyStudyDay = {
  date: string;
  weekday: string;
  active: boolean;
  minutes: number;
  completedTasks: number;
};

const weekdays = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

function shiftDate(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function studied(record: ReadingDayRecord | undefined): boolean {
  if (!record) return false;
  if (record.completedBlockIds.length > 0) return true;
  return Object.values(record.metrics).some((value) => Number(value) > 0);
}

function minutesOn(record: ReadingDayRecord | undefined): number {
  if (!record) return 0;
  const value = Number(record.metrics.mn);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateStreaks(
  records: Record<string, ReadingDayRecord>,
  today: string,
) {
  let current = 0;
  let cursor = studied(records[today]) ? today : shiftDate(today, -1);
  while (studied(records[cursor])) {
    current += 1;
    cursor = shiftDate(cursor, -1);
  }

  const activeDates = Object.keys(records)
    .filter((date) => studied(records[date]))
    .sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const date of activeDates) {
    run =
      previous && shiftDate(previous, 1) === date
        ? run + 1
        : 1;
    best = Math.max(best, run);
    previous = date;
  }
  return { current, best };
}

export function buildWeeklyReport(
  records: Record<string, ReadingDayRecord>,
  today: string,
) {
  const dayOfWeek = new Date(`${today}T00:00:00.000Z`).getUTCDay();
  const mondayOffset = (dayOfWeek + 6) % 7;
  const start = shiftDate(today, -mondayOffset);
  const days: WeeklyStudyDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(start, index);
    const record = records[date];
    const completedTasks = record?.completedBlockIds.length ?? 0;
    return {
      date,
      weekday: weekdays[index],
      active: studied(record),
      minutes: minutesOn(record),
      completedTasks,
    };
  });
  return {
    start,
    end: shiftDate(start, 6),
    days,
    activeDays: days.filter((day) => day.active).length,
    totalMinutes: days.reduce((sum, day) => sum + day.minutes, 0),
    completedTasks: days.reduce((sum, day) => sum + day.completedTasks, 0),
  };
}
