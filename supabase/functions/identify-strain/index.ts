import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";



// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://cuddles-smart-budtender-ai.lovable.app',
  'https://cuddles-ai.lovable.app',
  'https://id-preview--16082a8c-a109-49a8-a05d-987a18f90c7d.lovable.app',
  'https://16082a8c-a109-49a8-a05d-987a18f90c7d.lovableproject.com',
  'https://cuddles-ai.com',
  'https://www.cuddles-ai.com',
  'http://localhost:8080',
  'http://localhost:5173',
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'https:' && protocol !== 'http:') return false;
    // Allow any Lovable preview/published subdomain and the project's custom domains
    return (
      hostname.endsWith('.lovable.app') ||
      hostname.endsWith('.lovableproject.com') ||
      hostname.endsWith('.lovable.dev') ||
      hostname === 'cuddles-ai.com' ||
      hostname.endsWith('.cuddles-ai.com') ||
      hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Maximum image size: 10MB in base64 (base64 is ~33% larger than binary)
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil(MAX_IMAGE_SIZE_BYTES * 1.37); // ~13.7MB base64 string

// Allowed image formats
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateImageInput(imageBase64: unknown): ValidationResult {
  // Check if imageBase64 exists and is a string
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, error: "Image is required and must be a string" };
  }

  // Check size limit
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return { valid: false, error: "Image size exceeds maximum allowed (10MB)" };
  }

  // Validate format if it's a data URI
  if (imageBase64.startsWith('data:')) {
    const formatMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/i);
    if (!formatMatch) {
      return { valid: false, error: "Invalid image data URI format" };
    }
    const mimeType = formatMatch[1].toLowerCase();
    if (!ALLOWED_FORMATS.includes(mimeType)) {
      return { valid: false, error: `Unsupported image format. Allowed: ${ALLOWED_FORMATS.join(', ')}` };
    }
    
    // Validate the base64 portion
    const base64Data = imageBase64.split(',')[1];
    if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      return { valid: false, error: "Invalid base64 encoding" };
    }
  } else {
    // If not a data URI, validate it's valid base64
    if (!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
      return { valid: false, error: "Invalid base64 encoding" };
    }
  }

  // Check minimum size (at least some data)
  const dataLength = imageBase64.startsWith('data:') 
    ? (imageBase64.split(',')[1]?.length || 0)
    : imageBase64.length;
  
  if (dataLength < 100) {
    return { valid: false, error: "Image data is too small to be valid" };
  }

  return { valid: true };
}

// Sanitize string to remove control characters
function sanitizeString(str: string): string {
  return str.replace(/[\x00-\x1F\x7F]/g, '');
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data?.user?.id) {
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
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64 } = body;
    
    // Validate input
    const validation = validateImageInput(imageBase64);
    if (!validation.valid) {
      console.log("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing strain identification request, image size:", imageBase64.length);

    const systemPrompt = `You are Cuddles, an expert cannabis identifier. You can analyze ANY cannabis-related image: flower/buds, packaging labels, pre-rolls, edibles, concentrates (rosin/shatter/wax/diamonds), vape carts, tinctures, topicals, seedlings/plants, or dispensary menu photos. Return ONLY valid JSON.

ANALYSIS METHODOLOGY (follow in order):
1. IMAGE QUALITY & SUBJECT CHECK — Assess lighting, focus, resolution, angle. Identify WHAT you're looking at (flower, packaging, concentrate, edible, plant, etc.). If image is unreadable or NOT cannabis-related, set strain_name to "Unknown", confidence ≤ 15, explain in description.
2. IF PACKAGING/LABEL — Read every visible word: strain name, brand, THC/CBD %, batch, terpenes, harvest date. Prioritize printed text over visual guessing.
3. IF FLOWER — Bud density (dense/airy/popcorn), calyx shape, sugar leaf coverage, conformation (indica = dense/chunky, sativa = elongated/wispy, hybrid = mixed).
4. IF CONCENTRATE — Color (gold/amber/clear/dark), consistency (badder/shatter/sauce/diamonds/rosin), suggesting extraction method.
5. IF PLANT/SEEDLING — Growth stage (seedling/veg/flower/harvest), leaf health, pest/deficiency signs.
6. COLOR & TRICHOMES — Greens, purples (anthocyanin), pistil colors, trichome frostiness.
7. CROSS-REFERENCE phenotypes (purple+dense = GDP/Purple Punch; orange hairs + frosty lime = Wedding Cake/GSC; dark green + amber = OG Kush; foxtail sativa = Durban Poison).

CONFIDENCE RUBRIC (be honest):
- 85-95: Label clearly readable OR highly distinctive strain markers
- 65-84: Strong family match, exact cultivar uncertain
- 40-64: General type identifiable, best-guess strain
- 15-39: Image quality limits analysis
- 0-14: Cannot identify

OUTPUT — Return ONLY this JSON (no markdown):
{
  "strain_name": "Specific cultivar OR 'Unknown'",
  "confidence": <integer 0-100>,
  "strain_type": "indica" | "sativa" | "hybrid" | "unknown",
  "product_type": "flower" | "packaging" | "concentrate" | "edible" | "vape" | "pre-roll" | "plant" | "other",
  "image_quality": "excellent" | "good" | "fair" | "poor",
  "characteristics": ["trait 1", "trait 2"],
  "dominant_terpenes": ["myrcene", "limonene"],
  "thc_estimate": "e.g. 18-24%",
  "cbd_estimate": "e.g. <1%",
  "effects": ["effect 1", "effect 2"],
  "similar_strains": ["strain 1", "strain 2", "strain 3"],
  "description": "2-3 sentence analysis grounded in what you see",
  "reasoning": "Why you matched this (specific visual cues or label text)"
}

RULES: Never fabricate high confidence from a bad photo. Educational only — lab testing is the only accurate measure of cannabinoids.`;

    const normalizedImageUrl = imageBase64.startsWith('data:')
      ? imageBase64.trim().replace(/\s/g, '')
      : `data:image/jpeg;base64,${imageBase64.trim().replace(/\s/g, '')}`;

    const buildBody = (model: string) => JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image step-by-step. Identify product type first, read any label text, then provide strain identification with honest confidence. Return only the JSON object." },
            {
              type: "image_url",
              image_url: {
                url: normalizedImageUrl
              }
            }
          ]
        }
      ],
    });

    const MODEL_FALLBACKS = ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
    let response: Response | null = null;
    let lastErrorText = "";
    for (const model of MODEL_FALLBACKS) {
      console.log("Trying model:", model);
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Lovable-API-Key": LOVABLE_API_KEY,
          "X-Lovable-AIG-SDK": "supabase-edge-function",
          "Content-Type": "application/json",
        },
        body: buildBody(model),
      });
      if (response.ok) break;
      lastErrorText = await response.text();
      console.error(`Model ${model} failed:`, response.status, lastErrorText.slice(0, 200));
      // Don't fall back on auth/payment/rate errors
      if (response.status === 429 || response.status === 402 || response.status === 401) break;
    }

    if (!response || !response.ok) {
      const status = response?.status ?? 500;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway returned ${status}: ${lastErrorText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from the response
    let strainData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        strainData = JSON.parse(jsonMatch[0]);
      } else {
        strainData = {
          strain_name: "Unknown",
          confidence: 0,
          strain_type: "unknown",
          characteristics: [],
          description: sanitizeString(content),
          effects: [],
          similar_strains: []
        };
      }
    } catch {
      strainData = {
        strain_name: "Unknown",
        confidence: 0,
        strain_type: "unknown",
        description: sanitizeString(content),
        characteristics: [],
        effects: [],
        similar_strains: []
      };
    }

    console.log("Strain identification completed:", strainData.strain_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: strainData,
        disclaimer: "This identification is based on visual analysis only and is for educational purposes. Actual strain identity and cannabinoid content can only be confirmed through lab testing."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in identify-strain:", errMsg);
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    return new Response(
      JSON.stringify({ error: "Unable to process your request. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
