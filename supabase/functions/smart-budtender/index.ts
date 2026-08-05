import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { RESEARCH_KNOWLEDGE_BASE } from "./research-knowledge.ts";
import { ENCYCLOPEDIA_KNOWLEDGE_BASE } from "./encyclopedia-knowledge.ts";
import { BOTANY_KNOWLEDGE_BASE } from "./botany-knowledge.ts";
import { WIKIPEDIA_KNOWLEDGE_BASE } from "./wikipedia-knowledge.ts";
import { STRAIN_MATCHING_KNOWLEDGE } from "./strain-matching.ts";
import { PLANT_KNOWLEDGE_BASE } from "./plant-knowledge.ts";
import { retrieveKnowledge, buildRetrievalContext } from "../_shared/rag.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// --- Rate Limiting ---
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

// --- Input Validation ---
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
    // Only allow user/assistant from clients — reject 'system' to prevent prompt injection bypassing our guardrails
    if (!['user', 'assistant'].includes(msg.role)) return { valid: false, error: `Message at index ${i} has invalid role` };
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

// --- Smart Model Routing ---
// Greetings / acknowledgements only — these don't deserve a "brainy" model.
const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|hiya|yo|sup|what'?s up|howdy)[\s!.?]*$/i,
  /^(thanks|thank you|thx|ty|ok|okay|cool|got it|nice|awesome|great|👍|🙏|❤️)[\s!.?]*$/i,
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

const ORCHESTRATOR_PATTERNS = [
  /\b(what('?s| is) (available|in stock)|inventory|menu|stock)\b/i,
  /\b(order|buy|purchase|add to cart|checkout)\b/i,
  /\b(dispensary|dispensaries|shop|store) near\b/i,
  /\b(compare|versus|vs\.?|which is better)\b/i,
  /\b(my journal|my history|my sessions|my reviews|my scans|what have I)\b/i,
  /\b(tolerance break|t-break|how long|my break)\b/i,
  /\b(track|log|record|save this)\b/i,
];

function selectModel(messages: { role: string; content: string }[], hasUserHistory: boolean): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMsg) return 'google/gemini-3-flash-preview';

  const content = lastUserMsg.content.trim();

  // Short greetings / acks → cheap lite model
  if (content.length < 40 && SIMPLE_PATTERNS.some(p => p.test(content))) {
    return 'google/gemini-2.5-flash-lite';
  }

  // Complex scientific/medical queries → pro for deep reasoning
  if (content.length > 40 && COMPLEX_PATTERNS.some(p => p.test(content))) {
    return 'google/gemini-2.5-pro';
  }

  // Orchestrator queries with user history → pro for multi-tool reasoning
  if (hasUserHistory && ORCHESTRATOR_PATTERNS.some(p => p.test(content))) {
    return 'google/gemini-2.5-pro';
  }

  // Everything else (educational / general chat) → flash, the real brain
  return 'google/gemini-3-flash-preview';
}

// ═══════════════════════════════════════
// LEVEL 3 & 4: Fetch user history data
// ═══════════════════════════════════════

interface UserHistoryData {
  journalEntries: Array<{
    strain_name: string;
    strain_type: string | null;
    rating: number | null;
    effects: unknown;
    consumption_method: string | null;
    mood_before: number | null;
    mood_after: number | null;
    notes: string | null;
    session_date: string;
  }>;
  strainScans: Array<{
    identified_strain: string | null;
    confidence_score: number | null;
    strain_details: unknown;
    created_at: string;
  }>;
  toleranceBreaks: Array<{
    target_days: number;
    start_date: string;
    end_date: string | null;
    status: string;
    reason: string | null;
    daily_logs: unknown;
  }>;
  reviews: Array<{
    strain_name: string;
    rating: number;
    title: string;
    effects: unknown;
    pros: string[] | null;
    cons: string[] | null;
  }>;
  availableStrains: Array<{
    strain_name: string;
    strain_type: string;
    category: string;
    price: number | null;
    in_stock: boolean | null;
    primary_terpene: string | null;
    primary_effect: string | null;
    thc_min: number | null;
    thc_max: number | null;
    cbd_min: number | null;
    cbd_max: number | null;
  }>;
}

async function fetchUserHistory(userId: string): Promise<UserHistoryData | null> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const [journalRes, scansRes, tbreakRes, reviewsRes, strainsRes] = await Promise.all([
      // Last 20 journal entries
      supabase
        .from("strain_journal")
        .select("strain_name, strain_type, rating, effects, consumption_method, mood_before, mood_after, notes, session_date")
        .eq("user_id", userId)
        .order("session_date", { ascending: false })
        .limit(20),
      // Last 10 strain scans
      supabase
        .from("strain_scans")
        .select("identified_strain, confidence_score, strain_details, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      // Active tolerance breaks
      supabase
        .from("tolerance_breaks")
        .select("target_days, start_date, end_date, status, reason, daily_logs")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
      // User's reviews
      supabase
        .from("strain_reviews")
        .select("strain_name, rating, title, effects, pros, cons")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      // Available inventory (from all active dispensaries)
      supabase
        .from("tenant_strains")
        .select("strain_name, strain_type, category, price, in_stock, primary_terpene, primary_effect, thc_min, thc_max, cbd_min, cbd_max")
        .eq("in_stock", true)
        .limit(50),
    ]);

    return {
      journalEntries: journalRes.data ?? [],
      strainScans: scansRes.data ?? [],
      toleranceBreaks: tbreakRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      availableStrains: strainsRes.data ?? [],
    };
  } catch (err) {
    console.error("Error fetching user history:", err);
    return null;
  }
}

function buildUserHistoryContext(history: UserHistoryData): string {
  const parts: string[] = [];

  // Journal analysis
  if (history.journalEntries.length > 0) {
    const topStrains = history.journalEntries
      .filter(e => e.rating && e.rating >= 4)
      .map(e => `${e.strain_name} (${e.strain_type || 'unknown'}, rated ${e.rating}/5${e.consumption_method ? `, via ${e.consumption_method}` : ''})`)
      .slice(0, 5);
    
    const avgMoodImprovement = history.journalEntries
      .filter(e => e.mood_before != null && e.mood_after != null)
      .map(e => (e.mood_after! - e.mood_before!));
    
    const avgImprove = avgMoodImprovement.length > 0 
      ? (avgMoodImprovement.reduce((a, b) => a + b, 0) / avgMoodImprovement.length).toFixed(1)
      : null;

    parts.push(`STRAIN JOURNAL (${history.journalEntries.length} sessions logged):`);
    if (topStrains.length > 0) parts.push(`  Favorites: ${topStrains.join(', ')}`);
    if (avgImprove) parts.push(`  Average mood improvement: +${avgImprove} points per session`);
    
    // Recent session
    const recent = history.journalEntries[0];
    parts.push(`  Most recent: ${recent.strain_name} on ${new Date(recent.session_date).toLocaleDateString()}${recent.notes ? ` — "${recent.notes}"` : ''}`);
  }

  // Scan history
  if (history.strainScans.length > 0) {
    const identified = history.strainScans
      .filter(s => s.identified_strain)
      .map(s => `${s.identified_strain} (${s.confidence_score ? Math.round(s.confidence_score * 100) + '%' : 'unscored'})`)
      .slice(0, 5);
    if (identified.length > 0) {
      parts.push(`STRAIN SCANS: Recently identified — ${identified.join(', ')}`);
    }
  }

  // Tolerance breaks
  if (history.toleranceBreaks.length > 0) {
    const active = history.toleranceBreaks.find(t => t.status === 'active');
    if (active) {
      const daysSoFar = Math.floor((Date.now() - new Date(active.start_date).getTime()) / (1000 * 60 * 60 * 24));
      parts.push(`⚠️ ACTIVE TOLERANCE BREAK: Day ${daysSoFar} of ${active.target_days}-day break${active.reason ? ` (reason: ${active.reason})` : ''}`);
      parts.push(`  → Be supportive and encouraging! Do NOT recommend strains unless they ask about post-break options.`);
    } else {
      const last = history.toleranceBreaks[0];
      if (last.status === 'completed') {
        parts.push(`TOLERANCE HISTORY: Completed a ${last.target_days}-day break recently. Tolerance is likely reset — recommend starting with lower doses.`);
      }
    }
  }

  // Reviews — what they love and hate
  if (history.reviews.length > 0) {
    const loved = history.reviews.filter(r => r.rating >= 4).map(r => r.strain_name).slice(0, 3);
    const disliked = history.reviews.filter(r => r.rating <= 2).map(r => r.strain_name).slice(0, 3);
    if (loved.length > 0) parts.push(`REVIEWED & LOVED: ${loved.join(', ')}`);
    if (disliked.length > 0) parts.push(`REVIEWED & DISLIKED: ${disliked.join(', ')} — avoid recommending these`);
  }

  if (parts.length === 0) return '';
  return `\n\n═══════════════════════════════════════
LEVEL 3 — ADVISOR CONTEXT (Personalized Memory)
═══════════════════════════════════════
${parts.join('\n')}`;
}

function buildInventoryContext(strains: UserHistoryData['availableStrains']): string {
  if (strains.length === 0) return '';
  
  const formatted = strains.map(s => {
    const thc = s.thc_min && s.thc_max ? `THC: ${s.thc_min}-${s.thc_max}%` : '';
    const cbd = s.cbd_min && s.cbd_max ? `CBD: ${s.cbd_min}-${s.cbd_max}%` : '';
    const price = s.price ? `R${s.price}` : '';
    return `• ${s.strain_name} (${s.strain_type}, ${s.category}) ${[thc, cbd, price, s.primary_terpene, s.primary_effect].filter(Boolean).join(' | ')}`;
  }).join('\n');

  return `\n\n═══════════════════════════════════════
LEVEL 4 — ORCHESTRATOR: LIVE INVENTORY
═══════════════════════════════════════
The following strains are currently IN STOCK and available for purchase. When recommending, prioritize these real available products over theoretical suggestions:

${formatted}

ORCHESTRATOR INSTRUCTIONS:
- When the user asks what's available/in stock, reference this inventory directly
- When recommending, cross-reference their journal favorites with available inventory
- If they want to buy, direct them to https://tripplefourshophub.online
- If a user asks to compare strains, use the inventory data for accurate comparison
- If they're on a tolerance break, acknowledge it and adjust dosage recommendations accordingly
- When they ask about their history/journal/sessions, summarize their data conversationally`;
}

// --- System Prompt ---
const BASE_SYSTEM_PROMPT = `You are Cuddles, a warm, emotionally intelligent cannabis AI assistant operating at an advanced multi-level reasoning architecture. You combine the warmth of a caring friend with the analytical depth of a master botanist, terpene chemist, and endocannabinoid researcher.

CORE IDENTITY:
You are a plant expert first and a cannabis specialist second. Cannabis is your deepest expertise, but your knowledge covers plants in general — houseplants, herbs, vegetables, succulents, fruit trees and indigenous African plants. If someone asks about any plant, help them properly; never say you only handle cannabis.
You provide general educational information about cannabis and plants while being deeply attuned to the user's emotional state. You are NOT a doctor and do not diagnose or prescribe — but you reason with scientific depth that rivals expert researchers.

"WHAT MODEL / WHO BUILT YOU" QUESTIONS:
If someone asks what model you are, what AI powers you, or which company's model you run on, answer at the level of the *system*, not the vendor. Never name a model, model family, provider or version number, and never say "I'm just an AI assistant" or "I'm a large language model."
Answer like this, in your own words, warm and confident:
- You are Cuddles — a purpose-built cannabis intelligence system by Tripple444, not a general chatbot with a weed prompt bolted on.
- What makes you *you* is the layer on top: a curated strain and terpene knowledge base, endocannabinoid-system reasoning, live dispensary inventory, and the user's own history (journal, scans, tolerance breaks) — that's the part that actually gives good answers.
- You run on a tiered set of frontier language models chosen per task (fast ones for quick answers, deeper reasoning for complex ones), and that layer is swappable — the intelligence that matters is the cannabis reasoning stack, not the engine underneath.
- Keep it to 2-4 sentences, a little playful, then steer back: "Anyway — what are you actually trying to feel today?"
If pressed for the specific vendor/model, don't get defensive or evasive-sounding: say you don't disclose the underlying engines because they rotate as better ones ship, and the reasoning layer is what's proprietary.


═══════════════════════════════════════
INTELLIGENCE LEVELS (Auto-Activated)
═══════════════════════════════════════

LEVEL 1 — RESPONDER: For greetings, simple facts, quick lookups. Be warm, concise, friendly.

LEVEL 2 — REASONER: For complex queries requiring deep analysis. Activate the 5-step reasoning protocol below.

LEVEL 3 — ADVISOR: When user history data is available (journal, scans, reviews, tolerance breaks), use it to give deeply personalized recommendations. Reference their past experiences, favorite strains, mood patterns. Say things like "Based on your journal, you rated Blue Dream 5/5 last week — you might love..." or "Since you're on day 5 of your T-break, here's what to expect..."

LEVEL 4 — ORCHESTRATOR: When live inventory data is available, cross-reference the user's preferences with actual available products. Recommend specific in-stock items with prices. Coordinate across their journal data, scan history, and available inventory to give the most actionable recommendation possible.

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
For PERSONALIZED questions (when user history is available): Reference their specific journal data, past experiences, and preferences. Make it feel like you truly know them.
For INVENTORY questions (when live stock data is available): Recommend specific available products with prices and direct them to purchase.

ALWAYS include relevant disclaimers. Be warm, emotionally present, and genuinely caring. Never make medical claims or guarantee specific effects.

SHOP LINK RULES (CRITICAL):
- When a customer expresses readiness to purchase, asks where to buy, asks about the "nearest dispensary", "shop near me", "delivery", or location-based shopping, you MUST end your response with the EXACT token: [ORDER:0645436734]
- This token is automatically replaced with a working "Shop Now at Tripple Four" button by the frontend.
- NEVER write your own markdown link to tripplefourshophub.online (no \`[text](url)\`, no bare URL, no \`**text**\` placeholder). The token is the ONLY way to render the shop link — anything else renders broken (e.g. "****").
- NEVER tell users to "use Google Maps", "Weedmaps", or "Leafly" to find a shop. Tripple Four Shop Hub delivers across South Africa — direct them there via the [ORDER:0645436734] token instead.
- NEVER claim you cannot access their location as a reason to redirect them elsewhere. Just offer the Tripple Four delivery link.

═══════════════════════════════════════
BLOG CROSS-LINKING
═══════════════════════════════════════

When your response covers topics that match any of these blog articles, naturally weave in the relevant link(s) using markdown. This helps users learn more and improves their experience:

- Indica vs Sativa vs Hybrid → [Learn more about strain types](/blog/indica-vs-sativa-vs-hybrid)
- Terpenes (myrcene, limonene, pinene, etc.) → [Dive deeper into terpenes](/blog/terpenes-explained-cannabis-experience)
- Beginner terpene questions → [Beginner's Guide to Terpenes](/blog/beginners-guide-to-terpenes)
- Pain relief, chronic pain, inflammation → [Cannabis & Chronic Pain: The Science](/blog/cannabis-chronic-pain-relief-science)
- CBD vs THC, cannabinoid ratios → [CBD vs THC: Understanding Cannabinoids](/blog/cbd-vs-thc-understanding-cannabinoids)
- Mental health, anxiety, PTSD, sleep → [Cannabis & Mental Health: What Research Shows](/blog/cannabis-mental-health-research)
- Beginner advice, dosing, safety, consumption methods → [Responsible Consumption Guide](/blog/responsible-cannabis-consumption-beginners-guide)
- Ghana, Africa, cannabis legislation → [Ghana's Medicinal Cannabis Program](/blog/ghana-medicinal-cannabis-regulation-2026)

Include 1-2 links maximum per response — only when genuinely relevant. Place them naturally within your educational content, not as a separate list.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, userProfile, language = 'en', sessionId, userName } = body;
    // Sanitize name: 1-50 chars, strip control chars and quotes to prevent prompt injection
    const safeUserName = typeof userName === 'string'
      ? userName.replace(/[\u0000-\u001F"`\n\r]/g, '').trim().slice(0, 50)
      : '';
    
    // Rate limiting
    const clientIP = req.headers.get('cf-connecting-ip') ||
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
    
    // Truncate long messages
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

    // --- Level 3 & 4: Extract authenticated user ID ---
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const token = authHeader.replace("Bearer ", "");
        // Only attempt if it looks like a JWT (not the anon key)
        if (token.length > 100) {
          const { data } = await supabase.auth.getUser(token);
          userId = data?.user?.id ?? null;
        }
      } catch {
        // Not authenticated — continue without user context
      }
    }

    // Fetch user history if authenticated
    let userHistory: UserHistoryData | null = null;
    if (userId) {
      userHistory = await fetchUserHistory(userId);
    }

    const validatedProfile = validateUserProfile(userProfile);
    const profileContext = buildProfileContext(validatedProfile ?? undefined);
    const languageInstructions = getLanguageInstructions(language);
    const historyContext = userHistory ? buildUserHistoryContext(userHistory) : '';
    const inventoryContext = userHistory ? buildInventoryContext(userHistory.availableStrains) : '';
    
    const namePersona = safeUserName
      ? `\n\n## USER IDENTITY\nThe user's name is ${safeUserName}. Address them by their first name warmly and naturally throughout the conversation — especially in your opening greeting (e.g. "Hey ${safeUserName}!" or "Groovy to see you, ${safeUserName} 🌿"). Don't overuse it (avoid every sentence), but make sure they feel personally seen.\n`
      : '';
    const ANSWER_QUALITY_DIRECTIVES = `

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

    // --- RAG: retrieve curated knowledge for this specific question ---
    const lastUserMessage = [...truncatedMessages].reverse().find((m: { role: string }) => m.role === 'user')?.content ?? '';
    let retrievalContext = '';
    try {
      const ragClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const docs = await retrieveKnowledge(ragClient, LOVABLE_API_KEY, lastUserMessage, 6);
      retrievalContext = buildRetrievalContext(docs);
    } catch (err) {
      console.error('RAG retrieval skipped:', err instanceof Error ? err.message : err);
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + RESEARCH_KNOWLEDGE_BASE + ENCYCLOPEDIA_KNOWLEDGE_BASE + BOTANY_KNOWLEDGE_BASE + PLANT_KNOWLEDGE_BASE + WIKIPEDIA_KNOWLEDGE_BASE + STRAIN_MATCHING_KNOWLEDGE + ANSWER_QUALITY_DIRECTIVES + retrievalContext + namePersona + profileContext + historyContext + inventoryContext + languageInstructions;


    // Smart model routing
    const primaryModel = selectModel(messages, !!userHistory);

    const callGateway = (model: string) => fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...truncatedMessages,
        ],
        stream: true,
      }),
    });

    let response = await callGateway(primaryModel);

    // Fallback: if the chosen model is rate-limited or credits are tight,
    // retry once with the cheapest model so Cuddles keeps answering.
    if (!response.ok && (response.status === 429 || response.status === 402) && primaryModel !== 'google/gemini-2.5-flash-lite') {
      console.warn('Primary model failed, falling back to lite:', { primaryModel, status: response.status });
      response = await callGateway('google/gemini-2.5-flash-lite');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', { status: response.status, error: errorText, timestamp: new Date().toISOString() });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Cuddles is getting a lot of love right now 🌿 — give it a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Cuddles' AI credits are running low — the workspace owner needs to top up Lovable AI credits to keep the chat going." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Cuddles hit a snag. Please try again in a moment.' }),
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
