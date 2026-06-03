import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/components/GoogleAnalytics";

/**
 * Lightweight A/B testing + event tracker.
 * - Assigns a sticky variant per browser (localStorage) per experiment.
 * - Logs events to `public.ab_events` for the dashboard.
 * - Mirrors events to GA4 so we keep a second source of truth.
 */

const SESSION_KEY = "cuddles_ab_session";
const ASSIGN_PREFIX = "cuddles_ab_assign_";

const getSessionId = (): string => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
};

/** Deterministically hash a string to [0,1) — used for traffic split. */
const hash01 = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
};

/**
 * Assign (and persist) a variant for a named experiment.
 * Variants are weighted equally.
 */
export const getVariant = (experiment: string, variants: string[]): string => {
  if (!variants.length) return "control";
  try {
    const key = `${ASSIGN_PREFIX}${experiment}`;
    const existing = localStorage.getItem(key);
    if (existing && variants.includes(existing)) return existing;

    const sid = getSessionId();
    const bucket = Math.floor(hash01(`${experiment}:${sid}`) * variants.length);
    const variant = variants[bucket] ?? variants[0];
    localStorage.setItem(key, variant);
    return variant;
  } catch {
    return variants[0];
  }
};

export interface LogEventInput {
  experiment: string;
  variant?: string;
  event: string;
  properties?: Record<string, unknown>;
}

const inFlight = new Set<string>(); // dedupe rapid double-fires

export const logAbEvent = async ({ experiment, variant, event, properties }: LogEventInput) => {
  const sid = getSessionId();
  const v = variant ?? localStorage.getItem(`${ASSIGN_PREFIX}${experiment}`) ?? "control";
  const dedupeKey = `${experiment}:${v}:${event}:${sid}`;

  // Fire GA mirror immediately
  trackEvent(event, `ab:${experiment}`, v);

  // De-dupe one-shot funnel events within a session (chat_view, chat_start)
  const oneShot = event === "chat_view" || event === "chat_start";
  if (oneShot) {
    if (inFlight.has(dedupeKey)) return;
    if (sessionStorage.getItem(`abfired:${dedupeKey}`)) return;
    inFlight.add(dedupeKey);
    try { sessionStorage.setItem(`abfired:${dedupeKey}`, "1"); } catch { /* noop */ }
  }

  try {
    const { data: auth } = await supabase.auth.getUser();
    await supabase.from("ab_events").insert([{
      session_id: sid,
      user_id: auth.user?.id ?? undefined,
      experiment,
      variant: v,
      event_name: event,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      properties: (properties ?? {}) as any,
    }]);
  } catch (err) {
    // best-effort — never break UX for analytics
    console.warn("[abTest] log failed", err);
  } finally {
    inFlight.delete(dedupeKey);
  }
};

/** The single experiment we're currently running. */
export const CHAT_FAB_EXPERIMENT = "chat_fab_v1";
export const CHAT_FAB_VARIANTS = ["control", "rotating_hooks"] as const;
