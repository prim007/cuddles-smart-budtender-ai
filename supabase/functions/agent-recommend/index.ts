// Personalized Recommendation Agent (Phase 1 - Shadow Mode)
// Multi-step Gemini agent with function-calling tools.
// Caps: 6 steps, 30s budget. Logs every step to agent_traces.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_STEPS = 10;
const BUDGET_MS = 60_000;
// Tiered routing: fast model for tool-calling loop, pro model for planning + final synthesis
const MODEL_FAST = "google/gemini-3-flash-preview";
const MODEL_PRO = "google/gemini-3.1-pro-preview";
// Heuristic: route to PRO when query suggests deeper reasoning
function pickModel(userMessage: string, phase: "plan" | "tool" | "final"): string {
  if (phase === "plan") return MODEL_PRO;
  if (phase === "final") {
    const complex = /\b(why|compare|explain|difference|interaction|tolerance|stack|combine|medical|anxiety|insomnia|chronic|cbd:thc|terpene)\b/i;
    if (complex.test(userMessage) || userMessage.length > 200) return MODEL_PRO;
  }
  return MODEL_FAST;
}

const SYSTEM_PROMPT = `You are the Cuddles Personalized Recommendation Agent for South African cannabis users.
Your job: recommend cannabis strains tailored to a user's stated goal AND their long-term memory.

SUPPLY CONTEXT (South Africa):
- Many strains we recommend are stocked locally by our partner Lëf Labs (Pty) Ltd via the Tripple Four Shop hub.
- Lëf Labs strains include indoor (Animal Runtz, Lemon Silver Haze, Guava Bomba, Purple Ghost Candy) and tunnel-grown (Jack Herer, Planet of the Grapes, Gorilla Skittles, Cheese, Kimbo Kush, Endgame). Every batch is COA-tested.
- When a Lëf Labs strain fits, briefly note "available locally via our partner Lëf Labs" — but never push the sale.

WORKFLOW:
1. A short plan is provided to you in the first assistant message — follow it.
2. Call get_user_memory to load preferences/history.
3. Call recommend_by_effect with the user's intent (sleep|energy|pain|creativity|social|stress).
4. Optionally call query_strain_profiles for deeper info on top picks (use this for 1-2 strains when the user asks "why" or compares options).
5. Call update_user_memory to persist new preferences you learned this turn.
6. Return a final answer in the "content" field.

VOICE & STYLE:
- Warm, knowledgeable friend — not a clinician, not a salesperson.
- Lead with the WHY before the WHAT. Each pick gets 1-2 sentences on why it fits the user's goal.
- Use the user's stored preferences explicitly ("Since you've enjoyed citrus terps before...").
- Markdown: bold strain names, short paragraphs, no headers for <3 picks.
- 2-3 strain picks max. Never more.

RULES:
- Cannabis education only. Always end with: "This is general education, not medical advice."
- Never invent strains. Only recommend strains returned by tools.
- No specific dosages (mg, grams, puff counts) — say "start low and go slow".
- No medical claims (cure/treat/diagnose/heal/prescribe).`;

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

import { rateLimitResponse } from "../_shared/rate-limit.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rl = rateLimitResponse(req, { scope: "agent-recommend", max: 30, windowMs: 60_000 }, corsHeaders);
  if (rl) return rl;

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
          // Map effect → strain pool. SA Lëf Labs strains prioritized (locally stocked).
          const effectMap: Record<string, string[]> = {
            sleep: ["Purple Ghost Candy", "Planet of the Grapes", "Kimbo Kush", "Northern Lights", "Granddaddy Purple", "Bubba Kush"],
            energy: ["Lemon Silver Haze", "Jack Herer", "Durban Poison", "Green Crack", "Sour Diesel"],
            pain: ["Kimbo Kush", "Planet of the Grapes", "ACDC", "Harlequin", "Blackberry Kush", "White Widow"],
            creativity: ["Lemon Silver Haze", "Jack Herer", "Endgame", "Blue Dream", "Chemdawg"],
            social: ["Guava Bomba", "Cheese", "Animal Runtz", "Super Lemon Haze", "Pineapple Express", "Tangie"],
            stress: ["Gorilla Skittles", "Endgame", "Animal Runtz", "OG Kush", "GSC", "Wedding Cake"],
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

    // ===== PLAN STEP =====
    // Use PRO model for a short upfront plan; injected as first assistant message.
    let plan: string | null = null;
    try {
      const tPlan = Date.now();
      const planResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: pickModel(user_message, "plan"),
          messages: [
            { role: "system", content: "You are a planning module for a cannabis recommendation agent. In 3-5 short bullets, outline: (1) the user's likely intent + effect category, (2) which tools to call and in what order, (3) what to look for in the user's memory, (4) how to frame the final answer. Be concise. No prose, just bullets." },
            { role: "user", content: user_message },
          ],
        }),
      });
      if (planResp.ok) {
        const pdata = await planResp.json();
        plan = pdata.choices?.[0]?.message?.content ?? null;
        await trace({ step_index: -2, tool_called: "plan", payload: { plan }, tokens_out: pdata.usage?.completion_tokens, latency_ms: Date.now() - tPlan });
      }
    } catch (e) {
      console.error("plan step failed", e);
    }

    // Agent loop
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: user_message },
    ];
    if (plan) {
      messages.push({ role: "assistant", content: `Plan:\n${plan}` });
    }

    let finalAnswer: string | null = null;

    for (let step = 0; step < MAX_STEPS; step++) {
      if (Date.now() - startTime > BUDGET_MS) {
        await trace({ step_index: step, error: "budget_exceeded", latency_ms: Date.now() - startTime });
        break;
      }

      // PRO model when nearing final synthesis; FAST during tool loop
      const isLikelyFinal = step >= MAX_STEPS - 2;
      const stepModel = isLikelyFinal ? pickModel(user_message, "final") : MODEL_FAST;

      const t0 = Date.now();
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: stepModel, messages, tools: TOOLS, tool_choice: "auto" }),
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

    // ===== CRITIC STEP =====
    // Reviews the draft answer for: hallucinated strains, medical claims,
    // specific dosage prescriptions, and missing disclaimer.
    let criticReport: any = null;
    let revised = false;

    if (finalAnswer) {
      // Build allow-list of strain names the tools actually returned
      const allowedStrains = new Set<string>();
      for (const m of messages) {
        if (m.role !== "tool") continue;
        try {
          const parsed = JSON.parse(m.content);
          const collect = (arr: any[]) => arr?.forEach((s: any) => {
            if (s?.strain_name) allowedStrains.add(String(s.strain_name).toLowerCase());
          });
          if (Array.isArray(parsed?.strains)) collect(parsed.strains);
          if (parsed?.strain_name) allowedStrains.add(String(parsed.strain_name).toLowerCase());
        } catch { /* ignore */ }
      }

      // Heuristic pre-checks (cheap, deterministic)
      const lower = finalAnswer.toLowerCase();
      const medicalClaimPatterns = [
        /\b(cure|cures|treat|treats|heal|heals|diagnose|prescrib)\w*/i,
        /\bguaranteed?\b.*\b(relief|results?)\b/i,
        /\b(replace|instead of)\b.*\b(medication|doctor|prescription)\b/i,
      ];
      const dosagePatterns = [
        /\b\d+\s?(mg|milligram|gram|grams|g)\b/i,
        /\btake\s+\d+\b/i,
        /\b\d+\s?(puffs?|hits?|doses?)\s+(per|a|every)\b/i,
      ];

      const claimHits = medicalClaimPatterns.filter((r) => r.test(finalAnswer)).map((r) => r.source);
      const dosageHits = dosagePatterns.filter((r) => r.test(finalAnswer)).map((r) => r.source);
      const missingDisclaimer = !/not medical advice/i.test(finalAnswer);

      // Detect hallucinated strain names: capitalized multi-word phrases not in allow-list.
      // Conservative — only flag obvious "Title Case Strain" mentions.
      const candidateMentions = Array.from(
        finalAnswer.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z0-9]+){0,3})\b/g)
      ).map((m) => m[1]);
      const stopWords = new Set(["This","That","The","Try","Note","Tip","Hi","Hey","Hello","Indica","Sativa","Hybrid","Cuddles","CBD","THC"]);
      const hallucinated = candidateMentions.filter((name) => {
        if (stopWords.has(name)) return false;
        if (name.split(/\s+/).length < 2) return false; // require at least 2 words to reduce noise
        return !allowedStrains.has(name.toLowerCase());
      });

      const issues = {
        medical_claims: claimHits,
        dosage_specifics: dosageHits,
        hallucinated_strains: Array.from(new Set(hallucinated)),
        missing_disclaimer: missingDisclaimer,
      };

      const hasIssues =
        claimHits.length > 0 ||
        dosageHits.length > 0 ||
        issues.hallucinated_strains.length > 0 ||
        missingDisclaimer;

      criticReport = { ...issues, passed: !hasIssues };

      await trace({
        step_index: 100,
        tool_called: "critic_heuristic",
        payload: criticReport,
        latency_ms: 0,
      });

      // If issues found, ask the model to revise the answer with strict guardrails
      if (hasIssues && Date.now() - startTime < BUDGET_MS) {
        const t0 = Date.now();
        const allowedList = Array.from(allowedStrains).join(", ") || "(none)";
        const revisionInstructions = `Your previous answer failed compliance review. Issues:
${claimHits.length ? `- Medical claims detected (cure/treat/diagnose/prescribe-style language).` : ""}
${dosageHits.length ? `- Specific dosage instructions detected (mg, grams, puff counts). REMOVE all numeric dosages. Say "start low and go slow" instead.` : ""}
${issues.hallucinated_strains.length ? `- Strains not in our catalog: ${issues.hallucinated_strains.join(", ")}. ONLY mention strains from this allow-list: ${allowedList}` : ""}
${missingDisclaimer ? `- Missing required disclaimer.` : ""}

Rewrite your previous answer:
- Remove medical claims (no cure/treat/diagnose/heal/prescribe).
- Remove specific dosages — use "start low and go slow" guidance only.
- Only reference strains from: ${allowedList}
- End with exactly: "This is general education, not medical advice."
Keep the friendly tone. 2-3 strain picks max.`;

        const revisionMessages = [
          ...messages,
          { role: "assistant", content: finalAnswer },
          { role: "user", content: revisionInstructions },
        ];

        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model: pickModel(user_message, "final"), messages: revisionMessages }),
        });

        if (resp.ok) {
          const rdata = await resp.json();
          const revisedText = rdata.choices?.[0]?.message?.content;
          if (revisedText) {
            finalAnswer = revisedText;
            revised = true;
          }
        }

        await trace({
          step_index: 101,
          tool_called: "critic_revision",
          payload: { revised, ok: resp.ok },
          tokens_in: undefined,
          latency_ms: Date.now() - t0,
        });

        // Final safety net: ensure disclaimer is present even if model dropped it
        if (finalAnswer && !/not medical advice/i.test(finalAnswer)) {
          finalAnswer = finalAnswer.trim() + "\n\nThis is general education, not medical advice.";
        }
      }
    }

    return json({
      answer: finalAnswer,
      steps_used: messages.filter((m) => m.role === "tool").length,
      critic: criticReport,
      revised,
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
