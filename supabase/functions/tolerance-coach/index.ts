import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildClaudeRequest, parseClaudeMessage } from "../_shared/claude.ts";



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
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Validation constants
const MAX_STRING_LENGTH = 500;
const MIN_DAY_NUMBER = 1;
const MAX_DAY_NUMBER = 365;
const MIN_TARGET_DAYS = 1;
const MAX_TARGET_DAYS = 365;
const MIN_MOOD = 1;
const MAX_MOOD = 5;
const VALID_ACTIONS = ['start', 'daily_checkin', 'motivation', 'milestone', 'completed'];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface CoachInput {
  action?: string;
  dayNumber?: number;
  targetDays?: number;
  mood?: number;
  symptoms?: string;
  reason?: string;
}

// Sanitize string to remove control characters and trim
function sanitizeString(str: string | undefined, maxLength: number = MAX_STRING_LENGTH): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .slice(0, maxLength);
}

function validateInput(data: CoachInput): ValidationResult {
  // Validate action
  if (data.action && !VALID_ACTIONS.includes(data.action)) {
    return { valid: false, error: `Invalid action. Allowed: ${VALID_ACTIONS.join(', ')}` };
  }

  // Validate dayNumber
  if (data.dayNumber !== undefined) {
    if (typeof data.dayNumber !== 'number' || !Number.isInteger(data.dayNumber)) {
      return { valid: false, error: 'Day number must be an integer' };
    }
    if (data.dayNumber < MIN_DAY_NUMBER || data.dayNumber > MAX_DAY_NUMBER) {
      return { valid: false, error: `Day number must be between ${MIN_DAY_NUMBER} and ${MAX_DAY_NUMBER}` };
    }
  }

  // Validate targetDays
  if (data.targetDays !== undefined) {
    if (typeof data.targetDays !== 'number' || !Number.isInteger(data.targetDays)) {
      return { valid: false, error: 'Target days must be an integer' };
    }
    if (data.targetDays < MIN_TARGET_DAYS || data.targetDays > MAX_TARGET_DAYS) {
      return { valid: false, error: `Target days must be between ${MIN_TARGET_DAYS} and ${MAX_TARGET_DAYS}` };
    }
  }

  // Validate mood
  if (data.mood !== undefined) {
    if (typeof data.mood !== 'number' || !Number.isInteger(data.mood)) {
      return { valid: false, error: 'Mood must be an integer' };
    }
    if (data.mood < MIN_MOOD || data.mood > MAX_MOOD) {
      return { valid: false, error: `Mood must be between ${MIN_MOOD} and ${MAX_MOOD}` };
    }
  }

  // Validate string lengths
  if (data.symptoms && typeof data.symptoms === 'string' && data.symptoms.length > MAX_STRING_LENGTH) {
    return { valid: false, error: `Symptoms text too long (max ${MAX_STRING_LENGTH} characters)` };
  }

  if (data.reason && typeof data.reason === 'string' && data.reason.length > MAX_STRING_LENGTH) {
    return { valid: false, error: `Reason text too long (max ${MAX_STRING_LENGTH} characters)` };
  }

  return { valid: true };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { rateLimitResponse } = await import("../_shared/rate-limit.ts");
  const rl = rateLimitResponse(req, { scope: "tolerance-coach", max: 60, windowMs: 60_000 }, corsHeaders);
  if (rl) return rl;

  // Require auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabaseAuth.auth.getClaims(token);
    if (error || !data?.claims || data.claims.role !== "authenticated" || !data.claims.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {

    let body: CoachInput;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      console.log("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize string inputs
    const action = body.action || 'default';
    const dayNumber = body.dayNumber || 1;
    const targetDays = body.targetDays || 7;
    const mood = body.mood || 3;
    const symptoms = sanitizeString(body.symptoms);
    const reason = sanitizeString(body.reason);

    console.log("Processing tolerance coach request:", { action, dayNumber, targetDays, mood });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Cuddles, a supportive and encouraging tolerance break coach. Your role is to:
- Provide motivation and support during cannabis tolerance breaks
- Offer science-based information about how tolerance resets
- Suggest healthy coping strategies and activities
- Celebrate milestones and progress
- Be empathetic about withdrawal symptoms while encouraging persistence

Keep responses warm, supportive, and concise (2-3 sentences max unless asked for more detail).
Use emojis sparingly to add warmth. Never be preachy or judgmental.`;

    let userMessage = "";

    switch (action) {
      case "start":
        userMessage = `I'm starting a ${targetDays}-day tolerance break${reason ? ` because: ${reason}` : ""}. Give me an encouraging welcome message and a tip for day 1.`;
        break;
      case "daily_checkin":
        userMessage = `Day ${dayNumber} of ${targetDays}. My mood is ${mood}/5. ${symptoms ? `Symptoms I'm experiencing: ${symptoms}` : "No significant symptoms today."}. Give me encouragement and a helpful tip.`;
        break;
      case "motivation":
        userMessage = `I'm on day ${dayNumber} of ${targetDays} and feeling tempted to break my T-break. Help me stay strong with some motivation.`;
        break;
      case "milestone":
        userMessage = `I just reached day ${dayNumber} of my ${targetDays}-day tolerance break! Celebrate this milestone with me and tell me about the benefits I'm likely experiencing.`;
        break;
      case "completed":
        userMessage = `I completed my ${targetDays}-day tolerance break! Celebrate with me and give me advice for returning to cannabis responsibly.`;
        break;
      default:
        userMessage = `I'm on day ${dayNumber} of a ${targetDays}-day tolerance break. Give me some general encouragement.`;
    }

    const claudeReq = buildClaudeRequest(LOVABLE_API_KEY, {
      model: "anthropic/claude-haiku-4-5",
      maxTokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    });
    const response = await fetch(claudeReq.url, {
      method: "POST",
      headers: claudeReq.headers,
      body: JSON.stringify(claudeReq.body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to get coaching response");
    }

    const data = await response.json();
    const message = parseClaudeMessage(data).text || "Keep going! You're doing great! 💪";

    console.log("Tolerance coach response generated for action:", action);

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in tolerance-coach:", error);
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    return new Response(
      JSON.stringify({ error: "Unable to process your request. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
