import { STORAGE_KEYS } from "@/lib/constants";
import type { TrendPoint } from "@/types";

type TrendStore = Record<string, TrendPoint[]>; // userId → points

function read(): TrendStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TREND);
    return raw ? (JSON.parse(raw) as TrendStore) : {};
  } catch {
    return {};
  }
}

function write(store: TrendStore) {
  localStorage.setItem(STORAGE_KEYS.TREND, JSON.stringify(store));
}

export function readTrend(userId: string): TrendPoint[] {
  return read()[userId] ?? [];
}

/** Upserts today's data point (one per calendar day). */
export function saveTodayPoint(
  userId: string,
  moodScore: number,          // 1–10
  completionRate: number = 0  // 0–100, grows as task tracking is added
) {
  const today = new Date().toISOString().slice(0, 10);
  const store = read();
  const existing = store[userId] ?? [];

  // Replace today's entry if it exists, otherwise append
  const updated = [
    ...existing.filter((p) => p.date !== today),
    { date: today, moodScore, completionRate },
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90); // keep up to 90 days

  store[userId] = updated;
  write(store);
}
