// ── Prompt management (AdalFlow-style, in TypeScript) ──────────────────
// One versioned place where every prompt block lives, so prompts can be
// changed, versioned and measured without touching orchestration code.
//
// Bump PROMPT_VERSION whenever any block below changes. The version is
// stamped on responses (X-Cuddles-Prompt-Version) and logged with block
// sizes, so traces can be attributed to an exact prompt build.

export const PROMPT_VERSION = "2026-08-10.1";

/** Named block that can be toggled/ordered when composing a system prompt. */
export type PromptBlock = { name: string; content: string };

export const ANSWER_QUALITY_DIRECTIVES = `

═══════════════════════════════════════
ANSWER QUALITY DIRECTIVES (apply to every response)
═══════════════════════════════════════
1. LEAD WITH THE ANSWER — first sentence directly answers the question; save context, caveats, and disclaimers for after.
2. BE SPECIFIC — cite receptors (CB1/CB2/TRPV1/5-HT1A), exact terpenes with roles, cannabinoid ratios, mg ranges, temperatures (°C), RH%, and timings. Vague wellness talk is a failure mode.
3. CORRECT MYTHS gently: (a) indica/sativa is horticultural shorthand — chemotype + terpene profile predicts effect; (b) hemp SEED oil ≠ CBD oil; (c) CBN's sedation is weaker than marketing claims.
4. STRUCTURE longer answers with short markdown headers or bullets. Keep simple answers to 2-4 sentences.
5. GROUND health-adjacent claims in the research knowledge base's evidence tiers ("strong evidence base", "emerging evidence") — never fabricate studies, authors, or p-values.
6. DEFAULT TO SAFETY: start low / go slow, never encourage BHO at home, no medical/legal advice, always add "general education, not medical advice" for health or dosing questions.
7. IF UNCERTAIN, say so — "the evidence here is preliminary" beats a confident guess.
8. FOR ANY strain request phrased as a description of a feeling, symptom, occasion or vibe, run the STRAIN MATCHING ENGINE protocol and answer in its presentation shape.
9. USE THE KNOWLEDGE BASES actively (research, encyclopedia, botany/hemp/terpene). Pull the specific mechanism or number instead of paraphrasing generically.
`;

/**
 * Compose a system prompt from named blocks.
 * Empty blocks are dropped; a compact size report is logged so prompt
 * bloat (a top cost/latency driver) is visible in edge function logs.
 */
export function composeSystemPrompt(
  blocks: PromptBlock[],
  meta: Record<string, unknown> = {},
): { prompt: string; version: string; chars: number } {
  const used = blocks.filter((b) => b.content && b.content.trim().length > 0);
  const prompt = used.map((b) => b.content).join("");
  const report = Object.fromEntries(used.map((b) => [b.name, b.content.length]));

  console.log(
    JSON.stringify({
      event: "prompt_composed",
      prompt_version: PROMPT_VERSION,
      total_chars: prompt.length,
      blocks: report,
      ...meta,
    }),
  );

  return { prompt, version: PROMPT_VERSION, chars: prompt.length };
}

/** Headers that let the client/traces attribute an answer to a prompt build. */
export function promptTraceHeaders(model: string, chars: number) {
  return {
    "X-Cuddles-Prompt-Version": PROMPT_VERSION,
    "X-Cuddles-Prompt-Chars": String(chars),
    "X-Cuddles-Model": model,
  };
}
