import type { MockResult } from "@/context/AppDataContext";

export const mockSkills = [
  { key: "listening", label: "Listening", color: "chart1" },
  { key: "reading", label: "Reading", color: "chart2" },
  { key: "writing", label: "Writing", color: "chart3" },
  { key: "speaking", label: "Speaking", color: "chart4" },
] as const;

export type MockSkill = (typeof mockSkills)[number]["key"];

export function parseBandScore(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^(?:[0-8](?:\.0|\.5)?|9(?:\.0)?)$/.test(normalized)) return null;
  const score = Number(normalized);
  return Number.isFinite(score) && score >= 0 && score <= 9 ? score : null;
}

export function summarizeMocks(results: MockResult[]) {
  if (results.length === 0) {
    return {
      averages: null,
      weakest: [] as MockSkill[],
      weakestAverage: null as number | null,
    };
  }

  const averages = Object.fromEntries(
    mockSkills.map(({ key }) => [
      key,
      results.reduce((total, result) => total + result[key], 0) / results.length,
    ]),
  ) as Record<MockSkill, number>;
  const weakestAverage = Math.min(...mockSkills.map(({ key }) => averages[key]));
  const weakest = mockSkills
    .filter(({ key }) => Math.abs(averages[key] - weakestAverage) < 0.001)
    .map(({ key }) => key);

  return { averages, weakest, weakestAverage };
}

export function recentMocksForChart(results: MockResult[], limit = 6) {
  return [...results]
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
    )
    .slice(-limit);
}
