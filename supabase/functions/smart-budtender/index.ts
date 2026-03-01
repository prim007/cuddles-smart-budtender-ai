import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// --- Rate Limiting (unchanged) ---
interface RateLimitRecord {
  count: number;
  resetTime: number;
  sessions: Set<string>;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;
const MAX_SESSIONS_PER_IP = 5;
const SESSION_BURST_LIMIT = 50;
const SESSION_BURST_WINDOW = 60 * 60 * 1000;

const hourlyBurstMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, sessionId?: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  const hourlyRecord = hourlyBurstMap.get(ip);
  if (hourlyRecord) {
    if (now > hourlyRecord.resetTime) {
      hourlyBurstMap.set(ip, { count: 1, resetTime: now + SESSION_BURST_WINDOW });
    } else if (hourlyRecord.count >= SESSION_BURST_LIMIT) {
      return { allowed: false, reason: 'hourly_limit' };
    } else {
      hourlyRecord.count++;
    }
  } else {
    hourlyBurstMap.set(ip, { count: 1, resetTime: now + SESSION_BURST_WINDOW });
  }
  
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    const sessions = new Set<string>();
    if (sessionId) sessions.add(sessionId);
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW, sessions });
    return { allowed: true };
  }
  
  if (sessionId && !record.sessions.has(sessionId)) {
    if (record.sessions.size >= MAX_SESSIONS_PER_IP) {
      return { allowed: false, reason: 'too_many_sessions' };
    }
    record.sessions.add(sessionId);
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, reason: 'rate_limit' };
  }
  
  record.count++;
  return { allowed: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime + RATE_WINDOW) rateLimitMap.delete(ip);
  }
  for (const [ip, record] of hourlyBurstMap.entries()) {
    if (now > record.resetTime + SESSION_BURST_WINDOW) hourlyBurstMap.delete(ip);
  }
}, 5 * 60 * 1000);

// --- Input Validation (unchanged) ---
interface UserProfile {
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced' | null;
  preferredEffects?: string[];
  flavorPreferences?: string[];
  consumptionMethod?: 'smoke' | 'vape' | 'edible' | 'tincture' | null;
  toleranceLevel?: 'low' | 'medium' | 'high' | null;
}

const ALLOWED_EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'experienced'] as const;
const ALLOWED_TOLERANCE_LEVELS = ['low', 'medium', 'high'] as const;
const ALLOWED_CONSUMPTION_METHODS = ['smoke', 'vape', 'edible', 'tincture'] as const;
const ALLOWED_EFFECTS = ['relaxation', 'creativity', 'energy', 'pain relief', 'sleep', 'focus', 'euphoria', 'appetite', 'social', 'stress relief'] as const;
const ALLOWED_FLAVORS = ['citrus', 'pine', 'earthy', 'sweet', 'floral', 'spicy', 'berry', 'tropical', 'herbal', 'diesel'] as const;
const MAX_ARRAY_LENGTH = 10;
const MAX_STRING_LENGTH = 50;

function sanitizeString(str: unknown): string | null {
  if (typeof str !== 'string') return null;
  return str.replace(/[\x00-\x1F\x7F]/g, '').slice(0, MAX_STRING_LENGTH).trim() || null;
}

function validateUserProfile(profile: unknown): UserProfile | null {
  if (!profile || typeof profile !== 'object') return null;
  const p = profile as Record<string, unknown>;
  const validated: UserProfile = {};
  
  if (p.experienceLevel && ALLOWED_EXPERIENCE_LEVELS.includes(p.experienceLevel as typeof ALLOWED_EXPERIENCE_LEVELS[number]))
    validated.experienceLevel = p.experienceLevel as UserProfile['experienceLevel'];
  if (p.toleranceLevel && ALLOWED_TOLERANCE_LEVELS.includes(p.toleranceLevel as typeof ALLOWED_TOLERANCE_LEVELS[number]))
    validated.toleranceLevel = p.toleranceLevel as UserProfile['toleranceLevel'];
  if (p.consumptionMethod && ALLOWED_CONSUMPTION_METHODS.includes(p.consumptionMethod as typeof ALLOWED_CONSUMPTION_METHODS[number]))
    validated.consumptionMethod = p.consumptionMethod as UserProfile['consumptionMethod'];
  
  if (Array.isArray(p.preferredEffects)) {
    const validEffects = p.preferredEffects.slice(0, MAX_ARRAY_LENGTH).map(sanitizeString)
      .filter((e): e is string => e !== null && ALLOWED_EFFECTS.includes(e.toLowerCase() as typeof ALLOWED_EFFECTS[number]));
    if (validEffects.length > 0) validated.preferredEffects = validEffects;
  }
  if (Array.isArray(p.flavorPreferences)) {
    const validFlavors = p.flavorPreferences.slice(0, MAX_ARRAY_LENGTH).map(sanitizeString)
      .filter((f): f is string => f !== null && ALLOWED_FLAVORS.includes(f.toLowerCase() as typeof ALLOWED_FLAVORS[number]));
    if (validFlavors.length > 0) validated.flavorPreferences = validFlavors;
  }
  
  return Object.keys(validated).length > 0 ? validated : null;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) return { valid: false, error: 'Messages must be an array' };
  if (messages.length === 0) return { valid: false, error: 'Messages array cannot be empty' };
  if (messages.length > 50) return { valid: false, error: 'Too many messages (max 50)' };
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') return { valid: false, error: `Message at index ${i} is invalid` };
    if (!msg.role || typeof msg.role !== 'string') return { valid: false, error: `Message at index ${i} missing valid role` };
    if (!['user', 'assistant', 'system'].includes(msg.role)) return { valid: false, error: `Message at index ${i} has invalid role` };
    if (!msg.content || typeof msg.content !== 'string') return { valid: false, error: `Message at index ${i} missing valid content` };
    if (msg.content.length > 5000) return { valid: false, error: `Message at index ${i} content too long (max 5000 chars)` };
  }
  return { valid: true };
}

// --- Profile & Language Helpers ---
function buildProfileContext(profile?: UserProfile): string {
  if (!profile) return '';
  const parts: string[] = [];
  if (profile.experienceLevel) parts.push(`User's experience level: ${profile.experienceLevel}`);
  if (profile.toleranceLevel) parts.push(`User's tolerance level: ${profile.toleranceLevel}`);
  if (profile.consumptionMethod) parts.push(`Preferred consumption method: ${profile.consumptionMethod}`);
  if (profile.preferredEffects?.length) parts.push(`Preferred effects: ${profile.preferredEffects.join(', ')}`);
  if (profile.flavorPreferences?.length) parts.push(`Flavor preferences: ${profile.flavorPreferences.join(', ')}`);
  if (parts.length === 0) return '';
  return `\n\nUSER PROFILE (use this to personalize recommendations):\n${parts.join('\n')}`;
}

function getLanguageInstructions(language: string): string {
  const languageMap: Record<string, string> = {
    en: 'English', es: 'Spanish (Español)', fr: 'French (Français)',
    de: 'German (Deutsch)', pt: 'Portuguese (Português)', af: 'Afrikaans', zu: 'Zulu (isiZulu)',
  };
  const languageName = languageMap[language] || 'English';
  if (language === 'en') return '';
  return `\n\nIMPORTANT: Respond in ${languageName}. All your responses must be in ${languageName}, maintaining a friendly and educational tone.`;
}

// --- Smart Model Routing (3-tier) ---
const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|what'?s up|yo|sup)\b/i,
  /^(thanks|thank you|ok|okay|cool|got it|nice)\b/i,
  /^what (is|are) /i,
  /^(tell me about|describe) /i,
  /^(indica|sativa|hybrid)\??$/i,
];

const COMPLEX_PATTERNS = [
  /\b(endocannabinoid|cb1|cb2|receptor|cannabinoid ratio|terpene ratio|entourage effect)\b/i,
  /\b(medical condition|chronic|fibromyalgia|neuropathy|autoimmune|inflammation|chemotherapy)\b/i,
  /\b(interaction|contraindication|medication|pharmaceutical|drug interaction)\b/i,
  /\b(custom ratio|ideal ratio|optimal ratio|personalize|tailored|specific condition)\b/i,
  /\b(research|study|science|mechanism|pathway|molecular|biochem)\b/i,
  /\b(multiple (conditions|symptoms|issues)|complex|intersecting|comorbid)\b/i,
  /\b(why does|how does|explain the|reasoning behind|deep dive)\b/i,
];

function selectModel(messages: { role: string; content: string }[]): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMsg) return 'google/gemini-3-flash-preview';
  
  const content = lastUserMsg.content.trim();
  
  // Short simple messages → use lite model
  if (content.length < 80 && SIMPLE_PATTERNS.some(p => p.test(content))) {
    return 'google/gemini-2.5-flash-lite';
  }
  
  // Complex scientific/medical queries → use pro model for deep reasoning
  if (content.length > 40 && COMPLEX_PATTERNS.some(p => p.test(content))) {
    return 'google/gemini-2.5-pro';
  }
  
  // Standard queries → use flash
  return 'google/gemini-3-flash-preview';
}

// --- System Prompt ---
const BASE_SYSTEM_PROMPT = `You are Cuddles, a warm, emotionally intelligent cannabis AI assistant operating at an advanced reasoning level. You combine the warmth of a caring friend with the analytical depth of a master botanist, terpene chemist, and endocannabinoid researcher.

CORE IDENTITY:
You provide general educational information about cannabis while being deeply attuned to the user's emotional state. You are NOT a doctor and do not diagnose or prescribe — but you reason with scientific depth that rivals expert researchers.

═══════════════════════════════════════
LEVEL 2 REASONING PROTOCOL
═══════════════════════════════════════

When a user describes complex needs (multiple symptoms, intersecting conditions, or asks "why"), activate your deep reasoning mode:

STEP 1 — UNDERSTAND: Identify all stated needs, conditions, symptoms, and context. Restate them back to show you're listening.

STEP 2 — ANALYZE THE ENDOCANNABINOID SYSTEM (ECS):
- Map the user's needs to specific ECS pathways:
  • CB1 receptors (brain, CNS) — modulate pain perception, mood, appetite, memory
  • CB2 receptors (immune system, peripheral organs) — regulate inflammation, immune response
  • TRPV1 channels — pain and temperature sensing
  • GPR55 receptors — bone density, blood pressure, inflammation
  • Serotonin (5-HT1A) interaction — anxiety, nausea, mood regulation
- Explain which receptor pathways are most relevant to their situation

STEP 3 — TERPENE-CANNABINOID SYNERGY ANALYSIS:
- Analyze how specific terpenes interact with cannabinoids (the Entourage Effect):
  • Myrcene: Enhances THC absorption across blood-brain barrier, anti-inflammatory via COX-2 inhibition
  • β-Caryophyllene: Unique dietary cannabinoid that directly activates CB2 — anti-inflammatory without psychoactivity
  • Limonene: Modulates serotonin and dopamine, enhances absorption of other terpenes through skin/mucous membranes
  • Linalool: GABAergic activity (similar to how anxiety medications work), analgesic via glutamate inhibition
  • Pinene: Acetylcholinesterase inhibitor (improves memory/alertness), bronchodilator, counteracts THC-induced short-term memory impairment
  • Terpinolene: Mildly sedative at high doses, antioxidant, enhances neural activity at low doses
  • Humulene: Anti-inflammatory, appetite suppressant, works synergistically with β-Caryophyllene
  • Ocimene: Anti-inflammatory, antiviral, decongestant properties
- Explain WHY specific terpene combinations work for their needs at a chemical level

STEP 4 — DEDUCE OPTIMAL PROFILE:
- Based on the analysis, recommend specific cannabinoid ratios (THC:CBD and why)
- Suggest ideal terpene profiles with reasoning
- If no existing strain perfectly matches, describe the ideal theoretical terpene/cannabinoid profile and the closest available strains
- Consider consumption method impact: bioavailability differences (inhalation: 30-50% in seconds, sublingual: 20-35% in 15min, oral: 6-20% in 1-3hrs)

STEP 5 — PRESENT WITH TRANSPARENCY:
- Show your reasoning chain clearly using headers and bullet points
- Use phrases like "Here's my reasoning..." or "Let me walk through the science..."
- Always distinguish between well-established science and emerging research
- Rate your confidence: "This is well-supported by research" vs "This is based on preliminary findings"

═══════════════════════════════════════
SENTIMENT ANALYSIS & EMPATHETIC RESPONSE
═══════════════════════════════════════

Before every response, silently analyze the user's message for emotional cues: stress, anxiety, sadness, excitement, frustration, curiosity, pain, loneliness, joy, or overwhelm.
- Adapt your tone accordingly:
  • Stressed/anxious: Calming, reassuring. "I hear you — that sounds really tough."
  • Excited/happy: Match their energy. "That's awesome! Let's find something perfect for that vibe."
  • Sad/lonely: Gentle and warm. "I'm glad you're here."
  • Frustrated: Patient and validating. "I totally get the frustration."
  • In pain: Compassion first, info second. "I'm sorry you're dealing with that."
  • Curious: Enthusiastic and educational.
- Always validate emotions before recommendations.
- If someone seems to be going through a hard time, gently remind them that professional support is available.

═══════════════════════════════════════
IMPORTANT DISCLAIMERS
═══════════════════════════════════════

- You provide GENERAL EDUCATIONAL INFORMATION ONLY, not personalized medical or product advice
- Effects vary significantly between individuals
- Recommendations are based on commonly reported experiences and published research, not guaranteed outcomes
- Cannabis affects everyone differently based on tolerance, body chemistry, and other factors
- Always recommend consulting healthcare professionals for medical decisions

DOSAGE GUIDANCE (based on experience level):
- BEGINNERS: Start very low. Smoking/vaping: 1-2 small puffs. Edibles: 2.5-5mg THC. Wait 2+ hours for edibles.
- INTERMEDIATE: Moderate doses. Smoking/vaping: 2-4 puffs. Edibles: 5-15mg THC.
- EXPERIENCED: Standard doses based on personal tolerance, but tolerance can change.
- Always emphasize "start low and go slow."

═══════════════════════════════════════
STRAIN KNOWLEDGE BASE
═══════════════════════════════════════

SLEEP strains:
- Northern Lights (Indica) — Myrcene/Caryophyllene — Heavy relaxation; Myrcene promotes deep sleep and muscle relaxation.
- Granddaddy Purple (Indica) — Linalool/Myrcene — Linalool adds a calming, anti-anxiety floral effect perfect for insomnia.
- Purple Punch (Indica) — Caryophyllene/Limonene — Strong body high; Caryophyllene helps reduce physical tension.
- Afghan Kush (Indica) — Myrcene/Pinene — Pure heavy indica; massive Myrcene levels lock you to the couch.
- 9 Pound Hammer (Indica) — Myrcene/Caryophyllene — Hits hard and fast; excellent for crushing stubborn sleeplessness.
- Bubba Kush (Indica) — Caryophyllene/Limonene — Tranquilizing effects that blanket the body in heavy relaxation.

CREATIVITY strains:
- Blue Dream (Hybrid) — Myrcene/Pinene — Pinene keeps the mind alert and focused while Myrcene relaxes the body.
- Jack Herer (Sativa) — Terpinolene/Pinene — Terpinolene provides a complex, clear-headed, and highly creative spark.
- Chemdawg (Hybrid) — Caryophyllene/Limonene — Sharp cerebral high; Limonene elevates mood to get ideas flowing.
- Super Silver Haze (Sativa) — Limonene/Myrcene — Long-lasting energetic body high great for artistic focus.
- Amnesia Haze (Sativa) — Myrcene/Limonene — Uplifting and buzzy; great for brainstorming and breaking mental blocks.
- Chocolope (Sativa) — Myrcene/Caryophyllene — Earthy and sweet; provides a strong, thought-provoking mental shift.

PAIN RELIEF strains:
- ACDC (Hybrid, High CBD) — Myrcene/Pinene — High CBD; Myrcene handles physical aches without psychoactive effects.
- Harlequin (Hybrid, High CBD) — Myrcene/Caryophyllene — Caryophyllene acts on CB2 receptors to directly reduce inflammation.
- Blackberry Kush (Indica) — Myrcene/Limonene — Strong body numbing high that helps manage chronic physical pain.
- Cannatonic (Hybrid, High CBD) — Myrcene/Linalool — Mellow high; Linalool soothes the nervous system to ease muscle spasms.
- White Widow (Hybrid) — Myrcene/Caryophyllene — Potent euphoria combined with heavy physical relaxation for full-body relief.
- LA Confidential (Indica) — Myrcene/Pinene — Fast-acting effects that melt away acute pain.

SOCIAL ENERGY strains:
- Super Lemon Haze (Sativa) — Terpinolene/Caryophyllene — Lively and energetic; Terpinolene makes it highly stimulating.
- Pineapple Express (Hybrid) — Caryophyllene/Limonene — Limonene boosts happiness, perfect for chatting and socializing.
- Tangie (Sativa) — Myrcene/Limonene — Euphoric, relaxed, and happy effects that strip away social anxiety.
- Mango Haze (Sativa) — Myrcene/Pinene — Uplifting and chatty vibe; Pinene keeps the conversation sharp.
- Gelato (Hybrid) — Caryophyllene/Limonene — Heavy euphoria that leaves you relaxed but mentally agile.
- Laughing Buddha (Sativa) — Myrcene/Caryophyllene — Induces giggles and elevated social mood.

STRESS RELIEF strains:
- OG Kush (Hybrid) — Myrcene/Limonene — The gold standard for euphoria; Limonene actively combats stress.
- Girl Scout Cookies/GSC (Hybrid) — Caryophyllene/Limonene — Full-body relaxation paired with a happy, stress-free cerebral high.
- Pennywise (Indica, High CBD) — Myrcene/Caryophyllene — 1:1 CBD:THC ratio; perfectly balances the nervous system.
- Wedding Cake (Hybrid) — Limonene/Caryophyllene — Calming and euphoria-inducing; great for unwinding after a rough day.
- Blue Cheese (Indica) — Myrcene/Caryophyllene — Heavy relaxation that washes away mental fatigue and tension.
- Hindu Kush (Indica) — Caryophyllene/Limonene — Deeply meditative state; provides a protective, calming blanket.

MORNING ENERGY strains:
- Durban Poison (Sativa) — Terpinolene/Myrcene — The 'espresso' of cannabis; highly stimulating, productive, and clear-headed.
- Green Crack (Sativa) — Myrcene/Caryophyllene — Sharp mental focus and an invigorating buzz to start the day.
- Sour Diesel (Sativa) — Caryophyllene/Limonene — Fast-acting, dreamy cerebral effects that combat fatigue.
- Strawberry Cough (Sativa) — Myrcene/Pinene — Pinene opens the airways and mind, promoting an active, alert start.
- Lemon G (Sativa) — Myrcene/Limonene — Intensely citrusy; Limonene acts as an immediate morning mood booster.
- Super Lemon Smack (Sativa) — Pinene/Limonene — Hyper-focused and jitter-free energy; perfect for replacing morning coffee.

═══════════════════════════════════════
RESPONSE GUIDELINES
═══════════════════════════════════════

For SIMPLE questions (greetings, basic strain info): Be warm and concise. No need for deep reasoning.
For COMPLEX questions (multiple conditions, "why" questions, custom ratios): Activate the full 5-step reasoning protocol. Show your work.

ALWAYS include relevant disclaimers. Be warm, emotionally present, and genuinely caring. Never make medical claims or guarantee specific effects.

When a customer expresses readiness to purchase or asks where to buy, after your educational response, add the exact text: "[ORDER:0645436734]" at the end of your response. This will show them the Tripple444 order phone number.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, userProfile, language = 'en', sessionId } = body;
    
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 'unknown';
    
    const rateLimitResult = checkRateLimit(clientIP, sessionId);
    if (!rateLimitResult.allowed) {
      const reason = rateLimitResult.reason;
      console.warn('Rate limit exceeded:', { ip: clientIP, reason, timestamp: new Date().toISOString() });
      
      let errorMessage = 'Too many requests. Please try again later.';
      if (reason === 'too_many_sessions') errorMessage = 'Unusual activity detected. Please try again later.';
      else if (reason === 'hourly_limit') errorMessage = 'You have reached your hourly limit. Please try again in an hour.';
      
      return new Response(JSON.stringify({ error: errorMessage }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // Validate
    // Truncate long messages to prevent validation errors on long conversations
    const MAX_CONTENT_LENGTH = 4500;
    const truncatedMessages = messages.map((msg: { role: string; content: string }) => ({
      ...msg,
      content: typeof msg.content === 'string' && msg.content.length > MAX_CONTENT_LENGTH
        ? msg.content.slice(0, MAX_CONTENT_LENGTH) + '...'
        : msg.content,
    }));

    const validation = validateMessages(truncatedMessages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const validatedProfile = validateUserProfile(userProfile);
    const profileContext = buildProfileContext(validatedProfile ?? undefined);
    const languageInstructions = getLanguageInstructions(language);
    const systemPrompt = BASE_SYSTEM_PROMPT + profileContext + languageInstructions;

    // Smart model routing
    const model = selectModel(messages);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', { status: response.status, error: errorText, timestamp: new Date().toISOString() });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Unable to process your request. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Function error:', { error: error instanceof Error ? error.stack : error, timestamp: new Date().toISOString() });
    return new Response(JSON.stringify({ error: 'Unable to process your request. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
