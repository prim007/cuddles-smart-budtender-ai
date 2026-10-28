// Server-side Premium check shared by functions that gate extras.
// The AI chat itself is always free and must never call this.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    // Always re-verify with PayPal so cancellations take effect immediately.
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
      // Fail closed: an unverifiable subscription does not grant Premium.
    }
  }
  return { active: false, next_billing_at: null };
}

/** True when the user has an active Premium (card subscription row or PayPal). */
export async function isPremiumUser(admin: SupabaseClient, userId: string, email?: string | null): Promise<boolean> {
  const { data: card } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (card) return true;
  if ((await paypalPremium(admin, userId)).active) return true;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (email && stripeKey) {
    try {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length) {
        const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
        if (subs.data.length) return true;
      }
    } catch (e) {
      console.warn("[premium] Stripe check failed:", (e as Error).message);
    }
  }
  return false;
}
