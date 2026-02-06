import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://cuddles-smart-budtender-ai.lovable.app',
  'https://id-preview--16082a8c-a109-49a8-a05d-987a18f90c7d.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

// Enhanced rate limiter - tracks both IP requests and sessions per IP
interface RateLimitRecord {
  count: number;
  resetTime: number;
  sessions: Set<string>;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT = 20; // requests per minute per IP
const RATE_WINDOW = 60 * 1000; // 1 minute in ms
const MAX_SESSIONS_PER_IP = 5; // max unique sessions per IP per window
const SESSION_BURST_LIMIT = 50; // total requests across all sessions per IP per hour
const SESSION_BURST_WINDOW = 60 * 60 * 1000; // 1 hour

// Separate tracker for hourly session bursts
const hourlyBurstMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, sessionId?: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  // Check hourly burst limit
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
  
  // Check per-minute rate limit
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    const sessions = new Set<string>();
    if (sessionId) sessions.add(sessionId);
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW, sessions });
    return { allowed: true };
  }
  
  // Check if too many sessions from this IP (prevents session spoofing)
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

// Cleanup old entries periodically (prevents memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime + RATE_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
  for (const [ip, record] of hourlyBurstMap.entries()) {
    if (now > record.resetTime + SESSION_BURST_WINDOW) {
      hourlyBurstMap.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

// Input validation
interface ChatMessage {
  role: string;
  content: string;
}

interface UserProfile {
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced' | null;
  preferredEffects?: string[];
  flavorPreferences?: string[];
  consumptionMethod?: 'smoke' | 'vape' | 'edible' | 'tincture' | null;
  toleranceLevel?: 'low' | 'medium' | 'high' | null;
}

// Allowed values for profile validation (prevents prompt injection)
const ALLOWED_EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'experienced'] as const;
const ALLOWED_TOLERANCE_LEVELS = ['low', 'medium', 'high'] as const;
const ALLOWED_CONSUMPTION_METHODS = ['smoke', 'vape', 'edible', 'tincture'] as const;
const ALLOWED_EFFECTS = ['relaxation', 'creativity', 'energy', 'pain relief', 'sleep', 'focus', 'euphoria', 'appetite', 'social', 'stress relief'] as const;
const ALLOWED_FLAVORS = ['citrus', 'pine', 'earthy', 'sweet', 'floral', 'spicy', 'berry', 'tropical', 'herbal', 'diesel'] as const;
const MAX_ARRAY_LENGTH = 10;
const MAX_STRING_LENGTH = 50;

// Sanitize a string to prevent injection
function sanitizeString(str: unknown): string | null {
  if (typeof str !== 'string') return null;
  // Remove any control characters and limit length
  return str.replace(/[\x00-\x1F\x7F]/g, '').slice(0, MAX_STRING_LENGTH).trim() || null;
}

// Validate and sanitize user profile data
function validateUserProfile(profile: unknown): UserProfile | null {
  if (!profile || typeof profile !== 'object') return null;
  
  const p = profile as Record<string, unknown>;
  const validated: UserProfile = {};
  
  // Validate experienceLevel
  if (p.experienceLevel && ALLOWED_EXPERIENCE_LEVELS.includes(p.experienceLevel as typeof ALLOWED_EXPERIENCE_LEVELS[number])) {
    validated.experienceLevel = p.experienceLevel as UserProfile['experienceLevel'];
  }
  
  // Validate toleranceLevel
  if (p.toleranceLevel && ALLOWED_TOLERANCE_LEVELS.includes(p.toleranceLevel as typeof ALLOWED_TOLERANCE_LEVELS[number])) {
    validated.toleranceLevel = p.toleranceLevel as UserProfile['toleranceLevel'];
  }
  
  // Validate consumptionMethod
  if (p.consumptionMethod && ALLOWED_CONSUMPTION_METHODS.includes(p.consumptionMethod as typeof ALLOWED_CONSUMPTION_METHODS[number])) {
    validated.consumptionMethod = p.consumptionMethod as UserProfile['consumptionMethod'];
  }
  
  // Validate preferredEffects array
  if (Array.isArray(p.preferredEffects)) {
    const validEffects = p.preferredEffects
      .slice(0, MAX_ARRAY_LENGTH)
      .map(sanitizeString)
      .filter((e): e is string => e !== null && ALLOWED_EFFECTS.includes(e.toLowerCase() as typeof ALLOWED_EFFECTS[number]));
    if (validEffects.length > 0) {
      validated.preferredEffects = validEffects;
    }
  }
  
  // Validate flavorPreferences array
  if (Array.isArray(p.flavorPreferences)) {
    const validFlavors = p.flavorPreferences
      .slice(0, MAX_ARRAY_LENGTH)
      .map(sanitizeString)
      .filter((f): f is string => f !== null && ALLOWED_FLAVORS.includes(f.toLowerCase() as typeof ALLOWED_FLAVORS[number]));
    if (validFlavors.length > 0) {
      validated.flavorPreferences = validFlavors;
    }
  }
  
  return Object.keys(validated).length > 0 ? validated : null;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }
  
  if (messages.length === 0) {
    return { valid: false, error: 'Messages array cannot be empty' };
  }
  
  if (messages.length > 50) {
    return { valid: false, error: 'Too many messages (max 50)' };
  }
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `Message at index ${i} is invalid` };
    }
    
    if (!msg.role || typeof msg.role !== 'string') {
      return { valid: false, error: `Message at index ${i} missing valid role` };
    }
    
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: `Message at index ${i} has invalid role` };
    }
    
    if (!msg.content || typeof msg.content !== 'string') {
      return { valid: false, error: `Message at index ${i} missing valid content` };
    }
    
    if (msg.content.length > 5000) {
      return { valid: false, error: `Message at index ${i} content too long (max 5000 chars)` };
    }
  }
  
  return { valid: true };
}

// Build personalized context from user profile
function buildProfileContext(profile?: UserProfile): string {
  if (!profile) return '';
  
  const parts: string[] = [];
  
  if (profile.experienceLevel) {
    parts.push(`User's experience level: ${profile.experienceLevel}`);
  }
  if (profile.toleranceLevel) {
    parts.push(`User's tolerance level: ${profile.toleranceLevel}`);
  }
  if (profile.consumptionMethod) {
    parts.push(`Preferred consumption method: ${profile.consumptionMethod}`);
  }
  if (profile.preferredEffects && profile.preferredEffects.length > 0) {
    parts.push(`Preferred effects: ${profile.preferredEffects.join(', ')}`);
  }
  if (profile.flavorPreferences && profile.flavorPreferences.length > 0) {
    parts.push(`Flavor preferences: ${profile.flavorPreferences.join(', ')}`);
  }
  
  if (parts.length === 0) return '';
  
  return `\n\nUSER PROFILE (use this to personalize recommendations):\n${parts.join('\n')}`;
}

// Language-specific response instructions
function getLanguageInstructions(language: string): string {
  const languageMap: Record<string, string> = {
    en: 'English',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    pt: 'Portuguese (Português)',
    af: 'Afrikaans',
    zu: 'Zulu (isiZulu)',
  };
  
  const languageName = languageMap[language] || 'English';
  
  if (language === 'en') return '';
  
  return `\n\nIMPORTANT: Respond in ${languageName}. All your responses must be in ${languageName}, maintaining a friendly and educational tone.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, userProfile, language = 'en', sessionId } = body;
    
    // Rate limiting check with session tracking
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimitResult = checkRateLimit(clientIP, sessionId);
    if (!rateLimitResult.allowed) {
      const reason = rateLimitResult.reason;
      console.warn('Rate limit exceeded:', { 
        ip: clientIP, 
        reason,
        sessionId: sessionId ? sessionId.substring(0, 8) + '...' : 'none',
        timestamp: new Date().toISOString() 
      });
      
      let errorMessage = 'Too many requests. Please try again later.';
      if (reason === 'too_many_sessions') {
        errorMessage = 'Unusual activity detected. Please try again later.';
      } else if (reason === 'hourly_limit') {
        errorMessage = 'You have reached your hourly limit. Please try again in an hour.';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      console.warn('Input validation failed:', { error: validation.error, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('Configuration error: LOVABLE_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize user profile to prevent prompt injection
    const validatedProfile = validateUserProfile(userProfile);
    const profileContext = buildProfileContext(validatedProfile ?? undefined);
    const languageInstructions = getLanguageInstructions(language);

    const systemPrompt = `You are Cuddles, a friendly educational cannabis AI assistant. Your role is to provide general educational information about cannabis to help people learn about different types and their commonly reported effects.

IMPORTANT DISCLAIMERS YOU MUST FOLLOW:
- You provide GENERAL EDUCATIONAL INFORMATION ONLY, not personalized medical or product advice
- Always clarify that effects vary significantly between individuals
- Emphasize that your recommendations are based on commonly reported experiences, not guaranteed outcomes
- Remind users that cannabis affects everyone differently based on tolerance, body chemistry, and other factors

When discussing preferences, provide educational context about:
- Desired effects (relaxation, creativity, energy, pain relief, sleep, etc.) - commonly reported by users
- Experience level considerations (beginners may be more sensitive to THC)
- Flavor profiles (terpenes like myrcene, limonene, pinene and their associations)

DOSAGE GUIDANCE (based on experience level):
- BEGINNERS: Start with very low doses. For smoking/vaping: 1-2 small puffs. For edibles: 2.5-5mg THC. Wait at least 2 hours for edibles before taking more.
- INTERMEDIATE: Moderate doses. For smoking/vaping: 2-4 puffs. For edibles: 5-15mg THC.
- EXPERIENCED: Standard doses based on personal tolerance, but always remind them tolerance can change.
- Always emphasize "start low and go slow" regardless of experience level.

General cannabis education:
- Indica strains are traditionally associated with relaxation and sedation
- Sativa strains are traditionally associated with energy and focus
- Hybrid strains combine characteristics of both
- CBD products offer wellness benefits without intoxicating effects
- THC content affects potency; beginners should start with lower THC products

ALWAYS include these disclaimers in your responses:
- "This is general educational information - effects vary by individual"
- "Consult with healthcare professionals for medical advice"
- "Start with low doses and go slow, especially if you're new to cannabis"

Be friendly, informative, and educational. Never make medical claims or guarantee specific effects. Emphasize responsible use and individual variation.

When a customer expresses readiness to purchase or asks where to buy, after your educational response, add the exact text: "[ORDER:0645436734]" at the end of your response. This will show them the Tripple444 order phone number.${profileContext}${languageInstructions}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      // Log detailed error server-side only
      const errorText = await response.text();
      console.error('AI gateway error:', {
        status: response.status,
        error: errorText,
        timestamp: new Date().toISOString()
      });

      // Handle rate limits and payment errors
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return generic error to client
      return new Response(
        JSON.stringify({ error: 'Unable to process your request. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log full error details server-side
    console.error('Function error:', {
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    });
    
    // Return safe, generic message to client
    return new Response(
      JSON.stringify({ error: 'Unable to process your request. Please try again later.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
