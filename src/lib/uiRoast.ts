// Detects when a user is joking about / criticising the look and feel of the
// Cuddles interface, so the chat can invite them to suggest improvements.
// Deliberately conservative: it must NOT fire on normal cannabis questions.

const UI_TOPIC_RE =
  /\b(ui|ux|design|layout|interface|website|web\s*site|the\s+site|this\s+site|the\s+app|this\s+app|the\s+page|this\s+page|theme|colou?r\s*scheme|colou?rs|font|fonts|typography|buttons?|icons?|logo|look\s*and\s*feel|styling|graphics|animations?|branding)\b/i;

const UI_ROAST_RE =
  /\b(mess|messy|ugly|awful|terrible|horrible|trash|rubbish|kak|cringe|dated|outdated|old\s*school|boring|bland|cluttered|confusing|clunky|hideous|eyesore|lol|lmao|haha+|joke|funny|meme|roast|yikes|amateur|cheap|tacky|sucks?|garbage|1990s?|90s|2000s?)\b|😂|🤣|💀|\bneeds?\s+(a\s+)?(redesign|work|help|makeover)\b|\bis\s+(so\s+|really\s+|very\s+)?bad\b|\bnot\s+(nice|great|good|pretty)\b/i;

// Questions about products/strains should never trigger the prompt, even when
// they contain words like "look" or "bad".
const PRODUCT_CONTEXT_RE =
  /\b(strain|strains|weed|bud|flower|edible|edibles|vape|gummy|gummies|dose|dosage|thc|cbd|terpene|terpenes|indica|sativa|hybrid|menu|order|delivery|price|stock|high|sleep|anxiety|pain)\b/i;

export const isUiRoast = (text: string): boolean => {
  if (!text) return false;
  if (PRODUCT_CONTEXT_RE.test(text)) return false;
  return UI_TOPIC_RE.test(text) && UI_ROAST_RE.test(text);
};

export { UI_TOPIC_RE, UI_ROAST_RE };
