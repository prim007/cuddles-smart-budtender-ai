import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { messages } = body;
    
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

When a customer expresses readiness to purchase or asks where to buy, after your educational response, add the exact text: "[REDIRECT:https://tripplefour.co.za]" at the end of your response. This will trigger a purchase button.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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