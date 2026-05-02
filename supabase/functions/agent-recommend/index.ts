// Personalized Recommendation Agent (Phase 1 - Shadow Mode)
// Multi-step Gemini agent with function-calling tools.
// Caps: 6 steps, 30s budget. Logs every step to agent_traces.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_STEPS = 6;
const BUDGET_MS = 30_000;
const MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are the Cuddles Personalized Recommendation Agent.
Your job: recommend cannabis strains tailored to a user's stated goal AND their long-term memory.

WORKFLOW:
1. Call get_user_memory to load preferences/history.
2. Call recommend_by_effect with the user's intent (sleep|energy|pain|creativity|social|stress).
3. Optionally call query_strain_profiles for deeper info on top picks.
4. Call update_user_memory to persist new preferences you learned this turn.
5. Return a final answer in the "content" field — friendly, 2-3 strain picks max, with WHY each fits.

RULES:
- Cannabis education only. Always end with: "This is general education, not medical advice."
- Never invent strains. Only recommend strains returned by tools.
- Be concise. Markdown allowed.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_user_memory",
      description: "Load the user's long-term preferences and recent recommendations.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "recommend_by_effect",
      description: "Get strains matching a desired effect category.",
      parameters: {
        type: "object",
        properties: {
          effect: {
            type: "string",
            enum: ["sleep", "energy", "pain", "creativity", "social", "stress"],
          },
          limit: { type: "number", default: 5 },
        },
        required: ["effect"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_strain_profiles",
      description: "Look up rich profile data (terpenes, lineage, medical uses) for a strain by name.",
      parameters: {
        type: "object",
        properties: { strain_name: { type: "string" } },
        required: ["strain_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_user_memory",
      description: "Persist preferences learned this turn (effects, flavors, tolerance, last_recommendations).",
      parameters: {
        type: "object",
        properties: {
          preferences: { type: "object", additionalProperties: true },
          summary: { type: "string" },
          last_recommendations: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Require authenticated user; derive user_id from JWT (never trust client)
    const authHeader = req.headers.get("Authorization");
    let user_id: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const authClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
        );
        const token = authHeader.replace("Bearer ", "");
        const { data, error } = await authClient.auth.getClaims(token);
        if (!error && data?.claims?.sub) user_id = data.claims.sub as string;
      } catch { /* ignore */ }
    }
    if (!user_id) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { user_message, session_id } = body;
    if (!user_message || typeof user_message !== "string" || user_message.length > 2000) {
      return json({ error: "Invalid user_message" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 503);

    const trace = async (entry: Record<string, unknown>) => {
      try {
        await supabase.from("agent_traces").insert({
          session_id: session_id ?? null,
          user_id: user_id ?? null,
          agent_role: "recommendation",
          ...entry,
        });
      } catch (e) {
        console.error("trace insert failed", e);
      }
    };

    // Tool dispatcher
    const runTool = async (name: string, args: any): Promise<unknown> => {
      const t0 = Date.now();
      try {
        if (name === "get_user_memory") {
          if (!user_id) return { preferences: {}, summary: null, last_recommendations: [] };
          const { data } = await supabase
            .from("user_memory")
            .select("preferences, summary, last_recommendations")
            .eq("user_id", user_id)
            .maybeSingle();
          return data ?? { preferences: {}, summary: null, last_recommendations: [] };
        }

        if (name === "recommend_by_effect") {
          // Map effect → strain pool. Pulls from strain_profiles cache first.
          const effectMap: Record<string, string[]> = {
            sleep: ["Northern Lights", "Granddaddy Purple", "Purple Punch", "Bubba Kush", "Afghan Kush"],
            energy: ["Durban Poison", "Green Crack", "Sour Diesel", "Strawberry Cough"],
            pain: ["ACDC", "Harlequin", "Blackberry Kush", "White Widow", "LA Confidential"],
            creativity: ["Blue Dream", "Jack Herer", "Chemdawg", "Super Silver Haze"],
            social: ["Super Lemon Haze", "Pineapple Express", "Tangie", "Gelato"],
            stress: ["OG Kush", "GSC", "Wedding Cake", "Hindu Kush"],
          };
          const pool = effectMap[args.effect] ?? [];
          const limit = Math.min(args.limit ?? 5, pool.length);
          const { data } = await supabase
            .from("strain_profiles")
            .select("strain_name, strain_type, short_description, thc_range, terpenes, effects")
            .in("strain_name", pool.slice(0, limit));
          // fall back to bare names if not cached yet
          const found = data ?? [];
          const foundNames = new Set(found.map((s: any) => s.strain_name));
          const missing = pool.slice(0, limit).filter((n) => !foundNames.has(n)).map((n) => ({ strain_name: n }));
          return { effect: args.effect, strains: [...found, ...missing] };
        }

        if (name === "query_strain_profiles") {
          const { data } = await supabase
            .from("strain_profiles")
            .select("*")
            .ilike("strain_name", args.strain_name)
            .maybeSingle();
          return data ?? { found: false };
        }

        if (name === "update_user_memory") {
          if (!user_id) return { skipped: "no user_id" };
          await supabase.from("user_memory").upsert(
            {
              user_id,
              preferences: args.preferences ?? {},
              summary: args.summary ?? null,
              last_recommendations: args.last_recommendations ?? [],
            },
            { onConflict: "user_id" }
          );
          return { saved: true };
        }

        return { error: `unknown tool: ${name}` };
      } finally {
        await trace({
          step_index: -1,
          tool_called: name,
          payload: args,
          latency_ms: Date.now() - t0,
        });
      }
    };

    // Agent loop
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: user_message },
    ];

    let finalAnswer: string | null = null;

    for (let step = 0; step < MAX_STEPS; step++) {
      if (Date.now() - startTime > BUDGET_MS) {
        await trace({ step_index: step, error: "budget_exceeded", latency_ms: Date.now() - startTime });
        break;
      }

      const t0 = Date.now();
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: MODEL, messages, tools: TOOLS, tool_choice: "auto" }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        await trace({ step_index: step, error: `gateway ${resp.status}: ${errText}`, latency_ms: Date.now() - t0 });
        if (resp.status === 429) return json({ error: "Rate limit exceeded" }, 429);
        if (resp.status === 402) return json({ error: "AI credits exhausted" }, 402);
        return json({ error: "Agent gateway error" }, 502);
      }

      const data = await resp.json();
      const choice = data.choices?.[0];
      const msg = choice?.message;

      await trace({
        step_index: step,
        payload: { tool_calls: msg?.tool_calls?.map((tc: any) => tc.function?.name) ?? [] },
        tokens_in: data.usage?.prompt_tokens,
        tokens_out: data.usage?.completion_tokens,
        latency_ms: Date.now() - t0,
      });

      // Final answer (no more tool calls)
      if (!msg?.tool_calls || msg.tool_calls.length === 0) {
        finalAnswer = msg?.content ?? null;
        break;
      }

      // Push assistant message + execute each tool call
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        let args: any = {};
        try { args = JSON.parse(tc.function.arguments || "{}"); } catch { /* ignore */ }
        const result = await runTool(tc.function.name, args);
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }
    }

    return json({
      answer: finalAnswer,
      steps_used: messages.filter((m) => m.role === "tool").length,
      latency_ms: Date.now() - startTime,
    });
  } catch (e) {
    console.error("agent-recommend error", e);
    return json({ error: "An internal error occurred" }, 500);
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
