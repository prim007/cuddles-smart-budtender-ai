// Agent tools for Cuddles.
// The model decides when to call these instead of the client guessing with regexes.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";
import { readShopPage, searchReviews } from "./web-tools.ts";
import { consumeQuotas, DAY_SECONDS } from "../_shared/ai-quota.ts";

export interface ToolContext {
  admin: SupabaseClient;
  userId: string | null;
  sessionId?: string | null;
  agentRole?: string;
  /** Hashed visitor key (user id or IP hash) for per-person web lookup limits. */
  quotaKey?: string;
}

/** Web lookups cost money per call, so they have their own daily ceilings. */
export const WEB_LOOKUPS_PER_PERSON_DAILY = 15;
export const WEB_LOOKUPS_SITE_DAILY = 400;
const WEB_TOOLS = new Set(["read_shop_page", "search_reviews"]);

/** Tools that mutate data or spend money — never executed directly, always
 *  returned to the user as a pending approval they must confirm in chat. */
export const APPROVAL_REQUIRED = new Set(["start_checkout"]);

export const AGENT_TOOLS = [

  {
    type: "function",
    function: {
      name: "search_strains",
      description:
        "Search the live Cuddles strain catalogue (real in-stock products with prices, THC/CBD, terpenes). Use whenever the user asks what is available, what to buy, prices, or wants a recommendation grounded in real stock.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Strain name or partial name, e.g. 'Durban Poison'." },
          category: {
            type: "string",
            description: "Effect category: sleep, energy, creativity, stress, pain, social.",
          },
          limit: { type: "number", description: "Max results, default 8." },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_dispensaries",
      description:
        "Find real cannabis dispensaries near a place. Use when the user asks where to buy, for a shop/dispensary near them, or names a city/suburb.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "City, suburb or address, e.g. 'Sandton, Johannesburg'." },
          lat: { type: "number" },
          lng: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_memory",
      description:
        "Read what Cuddles remembers about this signed-in user (long-term preferences, past recommendations). Use before personalising a recommendation.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "save_user_preference",
      description:
        "Remember something durable the user just revealed about themselves (a liked/disliked strain, tolerance, a goal). Only call for genuinely lasting facts, never for small talk.",
      parameters: {
        type: "object",
        properties: {
          note: { type: "string", description: "One short sentence, written in third person, e.g. 'Dislikes Durban Poison — too racy.'" },
        },
        required: ["note"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_user_memory",
      description:
        "Persist structured long-term memory for this signed-in user: preferences learned this turn, a short rolling summary, and the strains you just recommended. Call at most once per turn, only when you genuinely learned something durable.",
      parameters: {
        type: "object",
        properties: {
          preferences: {
            type: "object",
            description: "Durable preference facts, e.g. { liked: ['Blue Dream'], disliked: ['Durban Poison'], tolerance: 'low', goals: ['sleep'] }.",
            additionalProperties: true,
          },
          summary: { type: "string", description: "Two or three sentences describing this user, third person." },
          last_recommendations: { type: "array", items: { type: "string" }, description: "Strain names recommended this turn." },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "start_checkout",
      description:
        "Propose a purchase for the user to confirm. This NEVER charges anyone — it returns a confirmation card the user must approve in the chat. Call only when the user has clearly chosen a product and wants to buy it.",
      parameters: {
        type: "object",
        properties: {
          strain_name: { type: "string", description: "Exact product name from search_strains." },
          quantity: { type: "number", description: "Units, default 1." },
          note: { type: "string", description: "Optional one-line note about the order." },
        },
        required: ["strain_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_shop_page",
      description:
        "Open a public web page the user pasted (usually a shop or dispensary menu) and read its text: product names, brands, types, prices, potency. Call whenever the user shares a link and asks about what's on it.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The full web address the user gave." },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_reviews",
      description:
        "Search what real people say about a product or brand (Reddit by default). Use after read_shop_page to compare listed products with community opinion, or when the user asks what Reddit/reviewers recommend. Make 1-2 focused searches, e.g. 'Tribal live resin cart review Ontario'.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Short search words: brand, product type, region." },
          reddit_only: { type: "boolean", description: "Default true. Set false to include other review sites." },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
] as const;

/** Filter the catalogue down to a specialist's allowed tools. */
export function toolsFor(names: string[]) {
  if (!names.length) return [];
  return AGENT_TOOLS.filter((t) => names.includes(t.function.name));
}


async function searchStrains(ctx: ToolContext, args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 8, 12);
  let q = ctx.admin
    .from("tenant_strains")
    .select("strain_name, strain_type, category, price, thc_min, thc_max, cbd_min, cbd_max, primary_terpene, primary_effect, notes, tenants!inner(status)")
    .eq("in_stock", true)
    // Only shops that are live (active or trial) — never inactive shops' menus.
    .in("tenants.status", ["active", "trial"])
    .limit(limit);

  const query = typeof args.query === "string" ? args.query.trim().slice(0, 60) : "";
  const category = typeof args.category === "string" ? args.category.trim().toLowerCase().slice(0, 30) : "";
  if (query) q = q.ilike("strain_name", `%${query}%`);
  else if (category) q = q.eq("category", category);

  const { data, error } = await q;
  if (error) return { error: "Strain lookup unavailable right now." };
  if (data?.length) {
    const results = data.map(({ tenants: _t, ...rest }: Record<string, unknown>) => rest);
    return { source: "live_inventory", results };
  }

  // No partner stock — fall back to the curated strain catalogue (no prices).
  let cat = ctx.admin
    .from("strain_profiles")
    .select("strain_name, strain_type, thc_range, cbd_range, effects, terpenes, short_description, strain_slug")
    .limit(limit);
  if (query) cat = cat.ilike("strain_name", `%${query}%`);
  const { data: profiles } = await cat;
  if (profiles?.length) {
    return {
      source: "strain_catalogue",
      note: "These are catalogue entries, not live stock — do not quote prices for them.",
      results: profiles,
    };
  }
  return { results: [], note: "No match found. Answer from general knowledge and say stock isn't listed." };

}

async function findDispensaries(args: Record<string, unknown>) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/daggaspot-dispensaries`;
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}`, apikey: anon },
      body: JSON.stringify({
        address: typeof args.address === "string" ? args.address.slice(0, 120) : undefined,
        lat: typeof args.lat === "number" ? args.lat : undefined,
        lng: typeof args.lng === "number" ? args.lng : undefined,
        limit: 5,
      }),
    });
    if (!res.ok) return { error: "Dispensary directory unavailable." };
    const json = await res.json();
    const list = Array.isArray(json?.dispensaries) ? json.dispensaries.slice(0, 5) : [];
    return { dispensaries: list, note: list.length ? undefined : "No listings found near that location." };
  } catch {
    return { error: "Dispensary directory unavailable." };
  }
}

async function getUserMemory(ctx: ToolContext) {
  if (!ctx.userId) return { note: "User is not signed in — no stored memory. Invite them to sign up to be remembered." };
  const { data } = await ctx.admin
    .from("user_memory")
    .select("summary, preferences, last_recommendations")
    .eq("user_id", ctx.userId)
    .maybeSingle();
  return data ?? { note: "No memory stored yet for this user." };
}

async function saveUserPreference(ctx: ToolContext, args: Record<string, unknown>) {
  if (!ctx.userId) return { saved: false, note: "Not signed in — cannot store memory." };
  const note = typeof args.note === "string" ? args.note.replace(/[\u0000-\u001F]/g, "").trim().slice(0, 240) : "";
  if (!note) return { saved: false };

  const { data: existing } = await ctx.admin
    .from("user_memory")
    .select("summary, preferences")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  const prev = Array.isArray((existing?.preferences as { notes?: unknown })?.notes)
    ? ((existing!.preferences as { notes: string[] }).notes)
    : [];
  const notes = [...prev.filter((n) => n !== note), note].slice(-20);

  const { error } = await ctx.admin.from("user_memory").upsert(
    {
      user_id: ctx.userId,
      preferences: { ...(existing?.preferences as Record<string, unknown> ?? {}), notes },
      summary: notes.slice(-5).join(" "),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("save_user_preference failed:", error.message);
    return { saved: false };
  }
  return { saved: true };
}

async function updateUserMemory(ctx: ToolContext, args: Record<string, unknown>) {
  if (!ctx.userId) return { saved: false, note: "Not signed in — cannot store memory." };

  const { data: existing } = await ctx.admin
    .from("user_memory")
    .select("summary, preferences, last_recommendations")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  const incoming = (args.preferences && typeof args.preferences === "object")
    ? args.preferences as Record<string, unknown>
    : {};
  const merged = { ...(existing?.preferences as Record<string, unknown> ?? {}), ...incoming };

  const recs = Array.isArray(args.last_recommendations)
    ? (args.last_recommendations as unknown[]).filter((r) => typeof r === "string").slice(0, 10)
    : (existing?.last_recommendations ?? []);

  const summary = typeof args.summary === "string" && args.summary.trim()
    ? args.summary.replace(/[\u0000-\u001F]/g, "").trim().slice(0, 600)
    : existing?.summary ?? null;

  const { error } = await ctx.admin.from("user_memory").upsert(
    {
      user_id: ctx.userId,
      preferences: merged,
      last_recommendations: recs,
      summary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("update_user_memory failed:", error.message);
    return { saved: false };
  }
  return { saved: true };
}

/** Never charges. Returns an approval card the client renders for confirmation. */
async function startCheckout(ctx: ToolContext, args: Record<string, unknown>) {
  const strainName = typeof args.strain_name === "string" ? args.strain_name.trim().slice(0, 80) : "";
  if (!strainName) return { requires_approval: false, error: "No product specified." };
  const quantity = Math.min(Math.max(Number(args.quantity) || 1, 1), 20);

  const { data: match } = await ctx.admin
    .from("tenant_strains")
    .select("id, strain_name, price, in_stock, tenants!inner(status)")
    .ilike("strain_name", `%${strainName.replace(/[%_\\]/g, (c) => `\\${c}`)}%`)
    .eq("in_stock", true)
    .in("tenants.status", ["active", "trial"])
    .limit(1)
    .maybeSingle();

  if (!match) {
    return { requires_approval: false, note: `${strainName} isn't in live stock, so no order can be started.` };
  }

  return {
    requires_approval: true,
    action: "checkout",
    strain_id: match.id,
    strain_name: match.strain_name,
    unit_price: match.price,
    quantity,
    estimated_total: Number(match.price ?? 0) * quantity,
    note: typeof args.note === "string" ? args.note.slice(0, 160) : undefined,
    instruction:
      "Nothing has been ordered. Tell the user exactly what you are proposing (product, quantity, total) and ask them to confirm before anything happens.",
  };
}

export async function runTool(name: string, rawArgs: string, ctx: ToolContext): Promise<unknown> {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    return { error: "Invalid tool arguments." };
  }

  const startedAt = Date.now();
  let result: unknown;
  let errorMsg: string | null = null;
  try {
    if (WEB_TOOLS.has(name)) {
      if (!ctx.userId) {
        return { error: "Reading web pages and review searches need a free Cuddles account. Ask the user to sign in, and answer from general knowledge meanwhile." };
      }
      const who = ctx.quotaKey ?? "unknown";
      const exhausted = await consumeQuotas([
        { bucket: `web:person:${who}`, limit: WEB_LOOKUPS_PER_PERSON_DAILY, windowSeconds: DAY_SECONDS },
        { bucket: "web:total", limit: WEB_LOOKUPS_SITE_DAILY, windowSeconds: DAY_SECONDS },
      ]);
      if (exhausted) {
        return { error: "Today's limit for reading web pages has been reached. Answer from general knowledge and say so." };
      }
    }
    switch (name) {
      case "search_strains":
        result = await searchStrains(ctx, args); break;
      case "find_dispensaries":
        result = await findDispensaries(args); break;
      case "get_user_memory":
        result = await getUserMemory(ctx); break;
      case "save_user_preference":
        result = await saveUserPreference(ctx, args); break;
      case "update_user_memory":
        result = await updateUserMemory(ctx, args); break;
      case "start_checkout":
        result = await startCheckout(ctx, args); break;
      case "read_shop_page":
        result = await readShopPage(args); break;
      case "search_reviews":
        result = await searchReviews(args); break;
      default:
        result = { error: `Unknown tool ${name}` };
    }
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : String(e);
    result = { error: "Tool failed." };
  }

  // Trace every step so /agent-traces can grade the agent.
  try {
    await ctx.admin.from("agent_traces").insert({
      session_id: ctx.sessionId ?? null,
      user_id: ctx.userId ?? null,
      agent_role: ctx.agentRole ?? "budtender",
      step_index: 0,
      tool_called: name,
      payload: args as Record<string, unknown>,
      result: JSON.parse(JSON.stringify(result ?? null)),
      latency_ms: Date.now() - startedAt,
      error: errorMsg,
    });
  } catch (e) {
    console.error("agent trace insert failed:", e instanceof Error ? e.message : e);
  }

  return result;
}


export function createToolClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
}
