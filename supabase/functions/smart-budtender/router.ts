// Triage router: a cheap classifier picks a specialist instead of firing one
// mega-prompt at every turn. Each specialist gets only the knowledge sections
// and tools it actually needs — cheaper and more accurate.

export type SpecialistRole =
  | "budtender"
  | "inventory"
  | "educator"
  | "grow_coach"
  | "smalltalk";

export interface Specialist {
  role: SpecialistRole;
  /** Knowledge section names (from the prompt registry composition) to keep. */
  sections: string[];
  /** Tool names this specialist may call. Empty = no tool loop. */
  tools: string[];
  /** Extra directive appended to the composed prompt. */
  directive: string;
  /** Max tool-planning steps. */
  maxSteps: number;
}

const ALL_KNOWLEDGE = [
  "research",
  "encyclopedia",
  "botany",
  "plants",
  "wikipedia",
  "strain_matching",
  "partner_catalogue",
];

export const SPECIALISTS: Record<SpecialistRole, Specialist> = {
  budtender: {
    role: "budtender",
    sections: ["strain_matching", "encyclopedia", "research", "partner_catalogue"],
    tools: ["search_strains", "get_user_memory", "save_user_preference", "update_user_memory"],
    directive:
      "You are operating as the BUDTENDER specialist: match the person to a strain or product using effects, terpenes, tolerance and their remembered preferences. Recommend 1-3 options, explain why, and keep the education-only framing.",
    maxSteps: 3,
  },
  inventory: {
    role: "inventory",
    sections: ["strain_matching", "partner_catalogue"],
    tools: ["search_strains", "find_dispensaries", "start_checkout", "get_user_memory"],
    directive:
      "You are operating as the INVENTORY specialist: answer about real stock, menus, specials and where to buy. Always ground answers in tool results or the partner catalogue — never invent stock. If someone asks about specials, deals or this month's catalogue, point them to the LëF Labs September 2026 catalogue shown in the chat and its Order now button (071 806 5754), without quoting confidential wholesale prices.",
    maxSteps: 3,
  },

  educator: {
    role: "educator",
    sections: ALL_KNOWLEDGE,
    tools: ["get_user_memory"],
    directive:
      "You are operating as the EDUCATOR specialist: explain the science — cannabinoids, terpenes, dosing, safety, law and history — clearly and accurately. Always include the 'not medical advice' framing when health comes up.",
    maxSteps: 1,
  },
  grow_coach: {
    role: "grow_coach",
    sections: ["botany", "plants"],
    tools: [],
    directive:
      "You are operating as the GROW COACH specialist: practical plant care — cannabis cultivation plus houseplants, herbs, succulents and vegetables. Give actionable, step-by-step guidance with light, water, soil and feeding specifics.",
    maxSteps: 0,
  },
  smalltalk: {
    role: "smalltalk",
    sections: [],
    tools: [],
    directive:
      "You are handling small talk. Be warm, brief and human. One or two sentences, then invite the real question.",
    maxSteps: 0,
  },
};

// Fast keyword pre-pass — avoids spending a gateway call on obvious turns.
const RULES: Array<{ role: SpecialistRole; re: RegExp }> = [
  { role: "smalltalk", re: /^(hi|hey|hello|yo|sup|howzit|thanks|thank you|ok|okay|cool|great|bye|good (morning|afternoon|evening))\b[\s!.?]*$/i },
  { role: "inventory", re: /\b(price|prices|cost|how much|in stock|stock|menu|specials?|deals?|promos?|catalogue|catalog|wholesale|bulk|buy|purchase|order|checkout|deliver|delivery|dispensar(y|ies)|shop|store|near me|nearby|for sale)\b/i },
  { role: "grow_coach", re: /\b(grow|growing|germinat|seedling|clone|soil|nutrient|npk|repot|water(ing)?|light schedule|veg stage|flower(ing)? stage|harvest|cure|drying|pest|spider mite|root rot|houseplant|monstera|succulent|herb garden|fertilis|fertiliz)\b/i },
  { role: "educator", re: /\b(what is|why does|how does|explain|science|research|study|studies|legal|law|history|endocannabinoid|terpene|cannabinoid|cbd|cbn|cbg|metaboli|drug test|interaction|side effect|evidence|label|coa|certificate of analysis)\b/i },
  { role: "budtender", re: /\b(recommend|suggest|best for|which strain|strain for|help me (sleep|relax|focus)|for (sleep|anxiety|pain|focus|energy|creativity|stress)|indica|sativa|hybrid|dose|dosage|tolerance|dagga|zol|skyf)\b/i },
];

// Keyword rules must never override obvious non-commercial context: medical
// programmes (e.g. TCUP), law, research, business or meta talk about the bot's
// own behaviour belong with the educator, even if they mention "dispensary".
const NON_COMMERCIAL_CONTEXT =
  /\b(tcup|medical (cannabis|programme|program|protocol|prescription|scheme)|prescription|prescribed|pharmac(y|ist|eutical)|sahpra|section ?21|clinical|doctor|physician|stud(y|ies)|research|thesis|policy|legislation|legal(ise|ize|isation|ization)?|law|bill|regulation|licens(e|ing|ed)|history|definition|meaning|what is a|what does|open(ing)? a|start(ing)? a)\b/i;
// The negation must sit directly before the pushing verb, otherwise ordinary
// requests ("I don't have a car, can you show me a dispensary near me?") would
// be misread as a complaint and lose shop help.
const META_REFLEX =
  /\b(?:(?:stop|quit|no\s+more|don'?t|do\s+not)\s+(?:[a-z]{1,12}\s+){0,2}(?:redirect|promot|advertis|push|send|show|point|recommend|suggest|list)(?:ing|e|es|s)?\s+(?:me\s+)?(?:[a-z]{1,10}\s+){0,3}(?:shop|store|link|dispensar)|ignore\s+(?:the\s+)?(?:word|keyword|d-?word|trigger)|d-?word|keyword\s+trigger|stop\s+triggering|(?:stop|no\s+more)\s+(?:with\s+)?(?:the\s+)?(?:shop|store|dispensary)\s+link)/i;

// Unambiguous buying intent — must keep the inventory tools even when the same
// sentence mentions "legal", "licensed" or "prescription".
const COMMERCE_OVERRIDE =
  /\b(where can i (buy|order)|i want to (buy|order)|order now|add to (cart|basket)|how much (is|are|does|do)\b[^.?!]{0,30}\b(gram|g\b|strain|edible|vape|pre-?roll|flower|weed|cannabis|product|it) (cost|is|are)?|(price|prices|cost)\b[^.?!]{0,30}\b(gram|g\b|strain|edible|vape|pre-?roll|flower|weed|cannabis|it)|in stock|out of stock|stock levels?|your (menu|catalogue|catalog|prices|stock|specials?|deals?)|show me (the )?(menu|shop|catalogue|catalog|dispensar)|deliver(y|ies)? (to|near|available)|any (specials?|deals?)|(specials?|deals?) (on|for|this|near|available)|(dispensar(y|ies)|shops?|stores?)[^.?!]{0,25}\b(near me|nearby|close by|around me|closest|nearest)|\b(near me|nearby|closest|nearest)[^.?!]{0,25}\b(dispensar(y|ies)|shops?|stores?)|(closest|nearest|local) dispensar|dispensar(y|ies) (near|in|around)\b)/i;

export function ruleRoute(message: string): SpecialistRole | null {
  // A complaint about being pushed to the shop wins, even if it names a shop.
  if (META_REFLEX.test(message)) return "educator";
  const commerce = COMMERCE_OVERRIDE.test(message);
  const nonCommercial = NON_COMMERCIAL_CONTEXT.test(message);
  for (const { role, re } of RULES) {
    if (!re.test(message)) continue;
    if (role === "inventory" && nonCommercial && !commerce) return "educator";
    return role;
  }
  if (commerce) return "inventory";
  return null;
}


const TRIAGE_MODEL = "google/gemini-2.5-flash-lite";

/**
 * Classify the turn. Tries cheap regex rules first, then a tiny triage call.
 * Never throws — falls back to the budtender specialist.
 */
export async function routeTurn(
  message: string,
  apiKey: string,
): Promise<{ specialist: Specialist; via: "rules" | "model" | "fallback" }> {
  const trimmed = (message ?? "").trim();
  const ruled = ruleRoute(trimmed);
  if (ruled) return { specialist: SPECIALISTS[ruled], via: "rules" };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: TRIAGE_MODEL,
        max_tokens: 8,
        messages: [
          {
            role: "system",
            content:
              "Classify the user's message into exactly one label and reply with the label only, nothing else. Labels: budtender (strain/product matching, effects, dosing for a person), inventory (stock, prices, menus, buying, delivery, dispensary locations), educator (science, law, history, general explanations), grow_coach (growing or caring for any plant), smalltalk (greetings, thanks, chit-chat).",
          },
          { role: "user", content: trimmed.slice(0, 500) },
        ],
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const label = String(json?.choices?.[0]?.message?.content ?? "")
        .toLowerCase()
        .replace(/[^a-z_]/g, "");
      if (label in SPECIALISTS) {
        return { specialist: SPECIALISTS[label as SpecialistRole], via: "model" };
      }
    }
  } catch (e) {
    console.error("triage failed:", e instanceof Error ? e.message : e);
  }
  return { specialist: SPECIALISTS.budtender, via: "fallback" };
}
