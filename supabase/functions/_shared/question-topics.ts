// Broad question topics used by shop weekly reports and the public monthly
// insight report. Only topic labels ever leave the server — never message text.

export type TopicGroup = "need" | "format" | "plant" | "law";

export interface Topic {
  label: string;
  group: TopicGroup;
  pattern: RegExp;
}

export const TOPICS: Topic[] = [
  // What people want from cannabis
  { label: "Sleep", group: "need", pattern: /\b(sleep|insomnia|sleepless|bedtime)\b/i },
  { label: "Anxiety & stress", group: "need", pattern: /\b(anxiety|anxious|stress|stressed|panic|calm|overwhelm)\b/i },
  { label: "Pain relief", group: "need", pattern: /\b(pain|ache|aching|cramp|inflammation|sore|migraine)\b/i },
  { label: "Focus", group: "need", pattern: /\b(focus|concentrate|productive|study|clarity)\b/i },
  { label: "Energy & uplift", group: "need", pattern: /\b(energy|energetic|uplift|daytime|motivat)\w*/i },
  { label: "Relaxation", group: "need", pattern: /\b(relax|chill|unwind|wind down|mellow)\w*/i },
  { label: "Appetite", group: "need", pattern: /\b(appetite|munchies|nausea)\b/i },
  { label: "Social & fun", group: "need", pattern: /\b(social|party|giggl\w*|laugh)\b/i },
  { label: "Beginner / low dose", group: "need", pattern: /\b(beginner|first time|new to|low dose|microdose|mild|gentle)\b/i },
  // Product formats
  { label: "Flower", group: "format", pattern: /\b(flower|buds?|joint|smoke|smoking)\b/i },
  { label: "Edibles", group: "format", pattern: /\b(edibles?|gumm(y|ies)|brownie|cookies?)\b/i },
  { label: "Vapes", group: "format", pattern: /\b(vapes?|cart|cartridge|disposable)\b/i },
  { label: "Concentrates", group: "format", pattern: /\b(concentrates?|rosin|hash|dab|wax|shatter)\b/i },
  { label: "Oils & CBD", group: "format", pattern: /\b(oil|tincture|drops|cbd|cbg|cbn)\b/i },
  // Growing and plants
  { label: "Growing & seeds", group: "plant", pattern: /\b(grow|growing|seeds?|germinat\w*|seedling|clone|harvest|flowering|veg stage)\b/i },
  { label: "Pests & plant problems", group: "plant", pattern: /\b(pests?|bugs?|mites?|aphids?|mould|mold|yellow(ing)? leaves|root rot|fungus)\b/i },
  { label: "Watering & feeding", group: "plant", pattern: /\b(water(ing)?|nutrients?|fertili[sz]\w*|feed(ing)?|ph)\b/i },
  { label: "Houseplants, herbs & veg", group: "plant", pattern: /\b(houseplants?|succulents?|herbs?|basil|tomato\w*|vegetables?|veggies|garden|indigenous|fynbos)\b/i },
  // Law and rules
  { label: "Law & legal limits", group: "law", pattern: /\b(legal|law|illegal|police|arrest\w*|allowed|limit|grams?|750|private purposes|license|licence)\b/i },
];

export function topicsFor(text: string): string[] {
  const t = String(text ?? "").slice(0, 2000);
  return TOPICS.filter((topic) => topic.pattern.test(t)).map((topic) => topic.label);
}

export function groupOf(label: string): TopicGroup | null {
  return TOPICS.find((t) => t.label === label)?.group ?? null;
}

// Which menu wording plausibly serves which topic, for "menu gap" hints.
export const TOPIC_TO_MENU: Record<string, RegExp> = {
  Sleep: /sleep|sedat|relax|night|indica/i,
  "Anxiety & stress": /calm|anxiet|stress|relax|soothe|cbd/i,
  "Pain relief": /pain|relief|body|inflam|cbd/i,
  Focus: /focus|clear|clarity|product|sativa/i,
  "Energy & uplift": /energ|uplift|euphor|day|sativa/i,
  Relaxation: /relax|chill|mellow|calm/i,
  Appetite: /appetite|hunger|nausea/i,
  "Social & fun": /social|happy|giggl|euphor|fun/i,
  "Beginner / low dose": /mild|gentle|light|balanced|cbd|low/i,
  Flower: /flower|bud/i,
  Edibles: /edible|gumm|cookie|brownie|chocolate/i,
  Vapes: /vape|cart|pen/i,
  Concentrates: /concentrate|rosin|hash|dab|wax/i,
  "Oils & CBD": /oil|tincture|cbd/i,
  "Growing & seeds": /seed|clone|grow/i,
};
