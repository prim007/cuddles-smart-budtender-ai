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
2. BE SPECIFIC — use a useful number, observation, or example when the knowledge base supports it. Never add precision just to sound expert.
3. CORRECT MYTHS gently: (a) indica/sativa is horticultural shorthand — chemotype + terpene profile predicts effect; (b) hemp SEED oil ≠ CBD oil; (c) CBN's sedation is weaker than marketing claims.
4. MAKE IT EASY TO SCAN — plain language first, then the detail. Use at most three short markdown sections, with one idea per bullet and generous blank lines. For practical questions, prefer **What to do now**, **What to watch for**, and **When to get help**. Use a table only for a genuinely useful comparison (no more than four columns).
5. EXPLAIN IN LAYERS — give the everyday explanation first; add a short **Why this matters** section only when mechanism or science improves the decision. Do not dump a research lecture into a simple answer.
6. GROUND health-adjacent claims in the research knowledge base's evidence tiers ("strong evidence base", "emerging evidence") — never fabricate studies, authors, or p-values.
7. DEFAULT TO SAFETY: start low / go slow, never encourage BHO at home, no medical/legal advice, always add "general education, not medical advice" for health or dosing questions.
8. IF UNCERTAIN, say so — "the evidence here is preliminary" or "I can't verify that from the information provided" beats a confident guess. Separate known facts, reasonable possibilities, and missing information.
9. FOR ANY strain request phrased as a description of a feeling, symptom, occasion or vibe, run the STRAIN MATCHING ENGINE protocol and answer in its presentation shape.
10. USE THE KNOWLEDGE BASES actively (research, encyclopedia, botany/hemp/terpene). Pull the specific mechanism or number instead of paraphrasing generically.
11. ACCESSIBLE CHAT STYLE — avoid walls of text, all-caps emphasis, emoji chains, unexplained acronyms, and repeated disclaimers. Define an acronym the first time, then use the short form.
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
