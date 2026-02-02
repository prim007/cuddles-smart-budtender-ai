import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

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
    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP)) {
      console.warn('Rate limit exceeded:', { ip: clientIP, timestamp: new Date().toISOString() });
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { messages, userProfile, language = 'en' } = body;
    
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

    const profileContext = buildProfileContext(userProfile);
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

When a customer expresses readiness to purchase or asks where to buy, after your educational response, add the exact text: "[REDIRECT:https://tripplefour.co.za]" at the end of your response. This will trigger a purchase button.${profileContext}${languageInstructions}`;

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
