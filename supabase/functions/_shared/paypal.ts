// PayPal is ONLY for the Cuddles Premium software subscription.
// Never use it for shop orders, delivery or any cannabis purchase.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const PAYPAL_ENV = (Deno.env.get("PAYPAL_ENV") ?? "sandbox") === "live" ? "live" : "sandbox";
const BASE = PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export const PAYPAL_PLANS = {
  monthly: { price: "5.49", interval: "MONTH", name: "Cuddles AI Premium Software Subscription (Monthly)" },
  yearly: { price: "49.00", interval: "YEAR", name: "Cuddles AI Premium Software Subscription (Yearly)" },
} as const;
export type PaypalPlanKey = keyof typeof PAYPAL_PLANS;

export const ACTIVE_STATUSES = new Set(["ACTIVE"]);

export async function paypalToken(): Promise<string> {
  const id = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!id || !secret) throw new Error("PayPal is not configured");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${id}:${secret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed [${res.status}]: ${await res.text()}`);
  return (await res.json()).access_token;
}

export async function paypalFetch(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PayPal ${path} failed [${res.status}]: ${text}`);
  return text ? JSON.parse(text) : {};
}

/** Returns the PayPal plan id, creating the product + plan once per environment. */
export async function ensurePlan(admin: SupabaseClient, token: string, key: PaypalPlanKey): Promise<string> {
  const rowKey = `${key}:${PAYPAL_ENV}`;
  const { data } = await admin.from("paypal_plans").select("paypal_plan_id").eq("key", rowKey).maybeSingle();
  if (data?.paypal_plan_id) return data.paypal_plan_id;

  const product = await paypalFetch(token, "/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({ name: "Cuddles AI Premium Software Subscription", type: "SERVICE", category: "SOFTWARE" }),
  });
  const p = PAYPAL_PLANS[key];
  const plan = await paypalFetch(token, "/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: product.id,
      name: p.name,
      billing_cycles: [{
        frequency: { interval_unit: p.interval, interval_count: 1 },
        tenure_type: "REGULAR", sequence: 1, total_cycles: 0,
        pricing_scheme: { fixed_price: { value: p.price, currency_code: "USD" } },
      }],
      payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 2 },
    }),
  });
  await admin.from("paypal_plans").upsert({ key: rowKey, env: PAYPAL_ENV, paypal_plan_id: plan.id });
  return plan.id;
}
