export type ReadingBlock = {
  id: string;
  t: string;
  m: number;
  h: string;
};

export type ReadingDayInfo = {
  n: number;
  w: number;
  c: number;
  bl: ReadingBlock[];
};

export function readingBlocks(w: number, c: number): ReadingBlock[] {
  w = Math.min(w, 12);
  const L: ReadingBlock = {
    id: "l",
    t: `Lug'at (Anki)`,
    m: 15,
    h: `8-10 yangi so'z, qolgani takrorlash. Avval eslang, keyin javobni oching.`,
  };
  const Kb: ReadingBlock = {
    id: "k",
    t: "Kitob",
    m: 25,
    h: `22 daqiqa to'xtamasdan o'qing, lug'atsiz. Oxirgi 3 daqiqada 2 jumlali xulosa yozing.`,
  };
  const M: ReadingBlock = {
    id: "m",
    t: `To'liq mock`,
    m: 60,
    h: `Rasmiy Cambridge testi, imtihon sharoitida: telefon yo'q, to'xtash yo'q.` +
      (w >= 9 ? ` Pacing: 17/20/23 daqiqa.` : ""),
  };
  if (w >= 9 && c === 3) {
    return [
      M,
      {
        id: "t",
        t: "Mock tahlili",
        m: 40,
        h: `Har xatoga harf, sabab va qoida yozing (Xatolar bo'limi).`,
      },
    ];
  }
  if (c === 6) return [M, Kb, L];
  if (c === 7) {
    return [
      {
        id: "a",
        t: "Mock tahlili",
        m: 60,
        h: `Har xatoga harf, sabab va qoida yozing (Xatolar bo'limi).`,
      },
      {
        id: "p",
        t: "Paraphrase ishi",
        m: 25,
        h: `Passage'larni javob kaliti bilan qayta o'qing. Eng muhim 15-20 juftlikni jadvalga va Anki'ga o'tkazing.`,
      },
      L,
    ];
  }
  const T = [
    "",
    "T/F/NG va Y/N/NG",
    "Headings va Matching Information",
    "Completion va MCQ",
    "3-passage (eng qiyin)",
    "Aralash passage",
  ][c];
  const lim = w <= 4 ? 25 : 20;
  return [
    {
      id: "z",
      t: "Maqola",
      m: w <= 4 ? 15 : 20,
      h: `Akademik maqola (The Conversation, BBC Future, Aeon). Har paragrafdan keyin 1 jumlali xulosa. Faqat 5-8 ta so'z belgilang.`,
    },
    Kb,
    L,
    {
      id: "v",
      t: "Vaqtli passage: " + T,
      m: lim,
      h: `Bitta Cambridge passage, taymer bilan: ${
        w <= 8
          ? lim + " daqiqa"
          : `1-passage 17, 2-passage 20, 3-passage 23 daqiqa`
      }. Natijangizni pastga yozing.`,
    },
    {
      id: "t",
      t: "Xato tahlili",
      m: 20,
      h: `10 daqiqa xato jurnali, 10 daqiqa paraphrase jadvali (kamida 5 juftlik, to'g'ri javoblardan ham).`,
    },
  ];
}

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parseDateKey(value);
  return !Number.isNaN(parsed.getTime()) && dateKey(parsed) === value;
}

export function shiftDateKey(value: string, amount: number): string {
  const date = parseDateKey(value);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

export function dateDifference(from: string, to: string): number {
  return Math.round(
    (parseDateKey(to).getTime() - parseDateKey(from).getTime()) / 86_400_000,
  );
}

export function readingDayInfo(
  startDate: string | null,
  selectedDate: string,
): ReadingDayInfo {
  const n = startDate ? dateDifference(startDate, selectedDate) + 1 : 0;
  const w = Math.ceil(n / 7);
  const c = ((n - 1) % 7 + 7) % 7 + 1;
  return {
    n,
    w,
    c,
    bl: n >= 1 && n <= 84 ? readingBlocks(w, c) : [],
  };
}

export function formatUzbekDate(value: string): string {
  return parseDateKey(value).toLocaleDateString("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
