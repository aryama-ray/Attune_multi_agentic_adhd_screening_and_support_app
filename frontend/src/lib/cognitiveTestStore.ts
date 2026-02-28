import type { CognitiveTestResult } from "@/types";

const STORE_KEY = "attune_cognitive_tests";

type Store = Record<string, CognitiveTestResult[]>; // userId → results

function read(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}

/** Save or replace the most recent result for a given test type. */
export function saveLocalTestResult(
  userId: string,
  result: Omit<CognitiveTestResult, "id" | "completedAt">,
) {
  const store = read();
  const existing = (store[userId] ?? []).filter((r) => r.testType !== result.testType);
  store[userId] = [
    ...existing,
    { ...result, id: crypto.randomUUID(), completedAt: new Date().toISOString() },
  ];
  write(store);
}

/** Get the latest result per test type for a user. */
export function readLocalTestResults(userId: string): CognitiveTestResult[] {
  return read()[userId] ?? [];
}
