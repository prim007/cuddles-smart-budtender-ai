// monthly-insight-report: public, anonymised "What people asked Cuddles" report.
//
// Privacy rules (see _shared/insight-report.ts):
//  - only topic labels are returned, never message text or any identifier
//  - topics seen in fewer than PUBLIC_MIN_COHORT conversations are withheld
//  - the conversation total is rounded to the nearest 10
//  - test traffic is excluded
// No AI is called; reads are rate-limited per visitor with database quotas.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { consumeQuotas, hashKey, HOUR_SECONDS } from "../_shared/ai-quota.ts";
import {
  countTopics,
  isTestMetadata,
  lastCompleteMonth,
  monthWindow,
  previousMonth,
  PUBLIC_MIN_COHORT,
  roundPublicTotal,
  shareChange,
  topicListsFromMessages,
} from "../_shared/insight-report.ts";
import { groupOf } from "../_shared/question-topics.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRST_MONTH = "2026-07";
const MAX_ROWS = 10000;

function json(body: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}

function listMonths(now: Date): string[] {
  const out: string[] = [];
  let m = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  while (m >= FIRST_MONTH) {
    out.push(m);
    m = previousMonth(m);
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
    const exhausted = await consumeQuotas([
      { bucket: `mir:ip-hour:${await hashKey(ip)}`, limit: 60, windowSeconds: HOUR_SECONDS },
      { bucket: "mir:total-hour", limit: 2000, windowSeconds: HOUR_SECONDS },
    ]);
    if (exhausted) return json({ error: "Too many requests. Please try again later." }, 429);

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const now = new Date();
    const month = typeof body?.month === "string" ? body.month : lastCompleteMonth(now);
    if (month < FIRST_MONTH) return json({ error: "No report for that month." }, 404);
    const win = monthWindow(month, now);
    if (!win) return json({ error: "No report for that month." }, 404);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const load = async (start: Date, end: Date) => {
      const { data, error } = await admin
        .from("chat_conversations")
        .select("user_message, user_metadata")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .limit(MAX_ROWS);
      if (error) throw error;
      return (data ?? [])
        .filter((r) => !isTestMetadata(r.user_metadata))
        .map((r) => String(r.user_message ?? ""));
    };

    const prevMonth = previousMonth(month);
    const prevWin = monthWindow(prevMonth, now);
    const [msgs, prevMsgs] = await Promise.all([
      load(win.start, win.end),
      prevWin && prevMonth >= FIRST_MONTH ? load(prevWin.start, prevWin.end) : Promise.resolve([] as string[]),
    ]);

    const topics = countTopics(topicListsFromMessages(msgs), PUBLIC_MIN_COHORT).map((t) => ({
      ...t,
      group: groupOf(t.label),
    }));
    const prevTopics = countTopics(topicListsFromMessages(prevMsgs), PUBLIC_MIN_COHORT);

    return json(
      {
        month,
        complete: win.complete,
        months: listMonths(now),
        min_cohort: PUBLIC_MIN_COHORT,
        conversations: roundPublicTotal(msgs.length),
        topics,
        change_vs_previous: shareChange(topics, prevTopics),
        generated_at: now.toISOString(),
      },
      200,
      { "Cache-Control": "public, max-age=3600" },
    );
  } catch (err) {
    console.error("monthly-insight-report: unexpected error", err);
    return json({ error: "Something went wrong" }, 500);
  }
});
