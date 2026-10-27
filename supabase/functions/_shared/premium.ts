// Server-side Premium check shared by functions that gate extras.
// The AI chat itself is always free and must never call this.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { ACTIVE_STATUSES, paypalFetch, paypalToken } from "./paypal.ts";

export interface PaypalPremium { active: boolean; next_billing_at: string | null }

/** Re-verifies the user's PayPal subscriptions with PayPal and stores the result. */
export async function paypalPremium(admin: SupabaseClient, userId: string): Promise<PaypalPremium> {
  const { data: rows } = await admin
    .from("paypal_subscriptions")
    .select("paypal_subscription_id, status, next_billing_at, updated_at")
    .eq("user_id", userId)
    .in("status", ["ACTIVE", "APPROVAL_PENDING", "APPROVED", "pending"]);
  if (!rows?.length) return { active: false, next_billing_at: null };

  let token: string | null = null;
  for (const row of rows) {
    // Trust a recent ACTIVE check for 6 hours to avoid hammering PayPal.
    const fresh = Date.now() - new Date(row.updated_at).getTime() < 6 * 3600_000;
    if (row.status === "ACTIVE" && fresh) return { active: true, next_billing_at: row.next_billing_at };
    try {
      token ??= await paypalToken();
      const sub = await paypalFetch(token, `/v1/billing/subscriptions/${encodeURIComponent(row.paypal_subscription_id)}`);
      const next = sub.billing_info?.next_billing_time ?? null;
      await admin.from("paypal_subscriptions")
        .update({ status: sub.status, next_billing_at: next, updated_at: new Date().toISOString() })
        .eq("paypal_subscription_id", row.paypal_subscription_id);
      if (ACTIVE_STATUSES.has(sub.status) && sub.custom_id === userId) return { active: true, next_billing_at: next };
    } catch (e) {
      console.warn("[premium] PayPal check failed:", (e as Error).message);
      if (row.status === "ACTIVE") return { active: true, next_billing_at: row.next_billing_at };
    }
  }
  return { active: false, next_billing_at: null };
}

/** True when the user has an active Premium (card subscription row or PayPal). */
export async function isPremiumUser(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data: card } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (card) return true;
  return (await paypalPremium(admin, userId)).active;
}
