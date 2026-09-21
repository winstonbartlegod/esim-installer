import type { LpaProfile } from "./lpa";

const KEY = "winston-esim.history.v1";
const LIMIT = 8;

export type HistoryEntry = {
  raw: string;
  smdp: string;
  matchingId: string;
  at: number;
};

export function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushHistory(profile: LpaProfile): HistoryEntry[] {
  const next: HistoryEntry[] = [
    {
      raw: profile.raw,
      smdp: profile.smdp,
      matchingId: profile.matchingId,
      at: Date.now(),
    },
    ...loadHistory().filter((e) => e.raw !== profile.raw),
  ].slice(0, LIMIT);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
