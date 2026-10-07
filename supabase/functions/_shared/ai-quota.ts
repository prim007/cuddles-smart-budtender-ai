// Database-backed AI spend quotas shared by every edge function replica.
//
// In-memory limiters reset on cold starts and are not shared between
// instances, so a scripted caller could exceed them by spreading requests.
// These counters live in public.ai_usage_quota (service-role only) and are
// incremented atomically by public.consume_ai_quota().

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

let client: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (!client) {
    client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
  }
  return client;
}

/** SHA-256 hash so raw visitor IPs are never stored. */
export async function hashKey(value: string): Promise<string> {
  const data = new TextEncoder().encode(`cuddles-quota:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface QuotaRule {
  bucket: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Consumes one unit from every rule. Returns the first rule that is exhausted,
 * or null when the request is allowed. On database errors the request is
 * allowed (in-memory limits still apply) so the free chat never goes dark.
 */
export async function consumeQuotas(rules: QuotaRule[]): Promise<QuotaRule | null> {
  for (const rule of rules) {
    try {
      const { data, error } = await admin().rpc("consume_ai_quota", {
        p_bucket: rule.bucket,
        p_limit: rule.limit,
        p_window_seconds: rule.windowSeconds,
      });
      if (error) {
        console.error("AI quota check failed:", error.message);
        continue;
      }
      if (data === false) return rule;
    } catch (err) {
      console.error("AI quota check failed:", err instanceof Error ? err.message : err);
    }
  }
  return null;
}

export const DAY_SECONDS = 24 * 60 * 60;
export const HOUR_SECONDS = 60 * 60;
