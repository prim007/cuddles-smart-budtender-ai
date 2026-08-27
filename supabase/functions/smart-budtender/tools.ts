// Agent tools for Cuddles.
// The model decides when to call these instead of the client guessing with regexes.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

export interface ToolContext {
  admin: SupabaseClient;
  userId: string | null;
}

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
] as const;

async function searchStrains(ctx: ToolContext, args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 8, 12);
  let q = ctx.admin
    .from("tenant_strains")
    .select("strain_name, strain_type, category, price, thc_min, thc_max, cbd_min, cbd_max, primary_terpene, primary_effect, notes")
    .eq("in_stock", true)
    .limit(limit);

  const query = typeof args.query === "string" ? args.query.trim().slice(0, 60) : "";
  const category = typeof args.category === "string" ? args.category.trim().toLowerCase().slice(0, 30) : "";
  if (query) q = q.ilike("strain_name", `%${query}%`);
  else if (category) q = q.eq("category", category);

  const { data, error } = await q;
  if (error) return { error: "Strain lookup unavailable right now." };
  if (data?.length) return { source: "live_inventory", results: data };

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

export async function runTool(name: string, rawArgs: string, ctx: ToolContext): Promise<unknown> {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    return { error: "Invalid tool arguments." };
  }
  switch (name) {
    case "search_strains":
      return await searchStrains(ctx, args);
    case "find_dispensaries":
      return await findDispensaries(args);
    case "get_user_memory":
      return await getUserMemory(ctx);
    case "save_user_preference":
      return await saveUserPreference(ctx, args);
    default:
      return { error: `Unknown tool ${name}` };
  }
}

export function createToolClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
}
