import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// In-memory IP rate limiter for cache-miss AI calls (per instance).
const ipHits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;
const checkIpRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return false;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return true;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { strain_name, force_refresh = false } = await req.json();
    if (!strain_name || typeof strain_name !== "string" || strain_name.length > 100) {
      return new Response(JSON.stringify({ error: "strain_name required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const slug = slugify(strain_name);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // For force_refresh (cache bypass = paid AI call), require authenticated user
    let effectiveForceRefresh = force_refresh;
    if (force_refresh) {
      const authHeader = req.headers.get("Authorization");
      let authed = false;
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const authClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
          );
          const token = authHeader.replace("Bearer ", "");
          const { data, error } = await authClient.auth.getClaims(token);
          if (!error && data?.claims) authed = true;
        } catch { /* ignore */ }
      }
      if (!authed) {
        // Silently downgrade: serve from cache only for anonymous callers
        effectiveForceRefresh = false;
      }
    }

    // Check cache
    if (!effectiveForceRefresh) {
      const { data: cached } = await supabase
        .from("strain_profiles")
        .select("*")
        .eq("strain_slug", slug)
        .maybeSingle();
      if (cached) {
        return new Response(JSON.stringify({ profile: cached, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Cache miss path → about to call paid AI. Enforce IP rate limit for unauthenticated callers.
    const authHeader2 = req.headers.get("Authorization");
    let isAuthed = false;
    if (authHeader2?.startsWith("Bearer ")) {
      try {
        const authClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
        );
        const token = authHeader2.replace("Bearer ", "");
        const { data, error } = await authClient.auth.getClaims(token);
        if (!error && data?.claims?.role === "authenticated") isAuthed = true;
      } catch { /* ignore */ }
    }
    if (!isAuthed) {
      const ip = req.headers.get("cf-connecting-ip")
        || req.headers.get("x-real-ip")
        || "unknown";

      if (!checkIpRateLimit(ip)) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later or sign in." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a cannabis education expert producing structured, factual strain profiles for general education only. Never give medical advice. Be accurate, neutral, and helpful.",
          },
          {
            role: "user",
            content: `Produce an in-depth strain profile for: ${strain_name}. Include realistic effects, common medical/wellness uses (educational only), potential negatives, flavor notes, terpene breakdown, THC/CBD ranges, lineage, growing difficulty, best time of day, and 4 similar strains. Keep descriptions vivid but factual.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_strain_profile",
              description: "Save the structured strain profile.",
              parameters: {
                type: "object",
                properties: {
                  strain_name: { type: "string" },
                  strain_type: {
                    type: "string",
                    enum: ["Indica", "Sativa", "Hybrid", "Indica-dominant Hybrid", "Sativa-dominant Hybrid", "CBD"],
                  },
                  short_description: { type: "string", description: "1-2 sentence hook" },
                  long_description: { type: "string", description: "3-4 paragraph deep dive" },
                  effects: { type: "array", items: { type: "string" }, description: "6-8 primary effects" },
                  medical_uses: { type: "array", items: { type: "string" }, description: "5-7 educational use cases" },
                  negatives: { type: "array", items: { type: "string" }, description: "3-5 potential negatives" },
                  flavors: { type: "array", items: { type: "string" }, description: "4-6 flavor notes" },
                  terpenes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        percentage: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["name", "description"],
                    },
                    description: "3-5 dominant terpenes",
                  },
                  thc_range: { type: "string", description: "e.g. 17-22%" },
                  cbd_range: { type: "string", description: "e.g. <1%" },
                  lineage: { type: "string", description: "Parent strains" },
                  growing_difficulty: { type: "string", enum: ["Easy", "Moderate", "Difficult"] },
                  best_time_of_day: { type: "string", enum: ["Morning", "Afternoon", "Evening", "Night", "Anytime"] },
                  similar_strains: { type: "array", items: { type: "string" }, description: "4 similar strain names" },
                },
                required: [
                  "strain_name", "strain_type", "short_description", "long_description",
                  "effects", "medical_uses", "negatives", "flavors", "terpenes",
                  "thc_range", "cbd_range", "lineage", "growing_difficulty",
                  "best_time_of_day", "similar_strains",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_strain_profile" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI error", aiResp.status, txt);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const args = JSON.parse(toolCall.function.arguments);

    const row = {
      strain_slug: slug,
      strain_name: args.strain_name,
      strain_type: args.strain_type,
      short_description: args.short_description,
      long_description: args.long_description,
      effects: args.effects,
      medical_uses: args.medical_uses,
      negatives: args.negatives,
      flavors: args.flavors,
      terpenes: args.terpenes,
      thc_range: args.thc_range,
      cbd_range: args.cbd_range,
      lineage: args.lineage,
      growing_difficulty: args.growing_difficulty,
      best_time_of_day: args.best_time_of_day,
      similar_strains: args.similar_strains,
      generated_at: new Date().toISOString(),
    };

    const { data: saved, error } = await supabase
      .from("strain_profiles")
      .upsert(row, { onConflict: "strain_slug" })
      .select()
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ profile: saved, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-strain-profile error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
