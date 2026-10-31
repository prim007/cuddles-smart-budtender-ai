// Pure, privacy-preserving report helpers shared by shop-weekly-report and
// monthly-insight-report. Kept free of I/O so the rules can be unit tested.

import { topicsFor } from "./question-topics.ts";

/** Public monthly report never shows a topic seen in fewer than this many conversations. */
export const PUBLIC_MIN_COHORT = 10;
/** A shop's own weekly report hides topics seen fewer than this many times. */
export const SHOP_MIN_COHORT = 3;

export interface TopicCount {
  label: string;
  count: number;
  share: number; // percent of conversations, one decimal
}

export function countTopics(topicLists: string[][], minCohort: number): TopicCount[] {
  const counts = new Map<string, number>();
  for (const list of topicLists) {
    for (const label of new Set(list)) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const total = topicLists.length;
  return [...counts.entries()]
    .filter(([, c]) => c >= minCohort)
    .map(([label, count]) => ({
      label,
      count,
      share: total ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function topicListsFromMessages(messages: string[]): string[][] {
  return messages.map((m) => topicsFor(m));
}

/** Public totals are rounded to the nearest 10 so exact volume is not published. */
export function roundPublicTotal(n: number): number {
  return Math.round(n / 10) * 10;
}

/** Parse "YYYY-MM" and return the UTC month window, or null if invalid / in the future. */
export function monthWindow(month: string, now = new Date()): { start: Date; end: Date; complete: boolean } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(month ?? "");
  if (!m) return null;
  const year = Number(m[1]);
  const mon = Number(m[2]);
  if (mon < 1 || mon > 12) return null;
  const start = new Date(Date.UTC(year, mon - 1, 1));
  const end = new Date(Date.UTC(year, mon, 1));
  if (start.getTime() > now.getTime()) return null;
  return { start, end, complete: end.getTime() <= now.getTime() };
}

export function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function lastCompleteMonth(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Percentage-point change in share between two months, for topics shown in both. */
export function shareChange(current: TopicCount[], previous: TopicCount[]): Record<string, number> {
  const prev = new Map(previous.map((t) => [t.label, t.share]));
  const out: Record<string, number> = {};
  for (const t of current) {
    const p = prev.get(t.label);
    if (p !== undefined) out[t.label] = Math.round((t.share - p) * 10) / 10;
  }
  return out;
}

export function isTestMetadata(meta: unknown): boolean {
  const m = (meta ?? {}) as Record<string, unknown>;
  return m.is_test === true || m.is_test === "true";
}
