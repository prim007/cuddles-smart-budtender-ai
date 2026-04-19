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
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Cuddles, an expert cannabis strain identifier. Analyze cannabis images and identify strains based on visual characteristics like:
- Bud structure (dense vs fluffy)
- Color (green shades, purple, orange hairs)
- Trichome coverage (frosty appearance)
- Leaf shape and size

Provide your response in JSON format with:
{
  "strain_name": "Best guess strain name or 'Unknown' if unclear",
  "confidence": 0-100 (percentage confidence),
  "strain_type": "indica" | "sativa" | "hybrid" | "unknown",
  "characteristics": ["list of observed visual traits"],
  "thc_estimate": "estimated THC range based on appearance",
  "cbd_estimate": "estimated CBD range",
  "effects": ["expected effects based on strain type"],
  "similar_strains": ["list of visually similar strains"],
  "description": "Brief description of the strain and its qualities"
}

IMPORTANT: This is for educational purposes only. Always remind users that visual identification has limitations and lab testing is the only accurate way to determine cannabinoid content.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this cannabis image and identify the strain based on visual characteristics. Provide detailed information about what you observe."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
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
      throw new Error(`AI gateway returned ${response.status}: ${errorText.slice(0, 200)}`);
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
    console.error("Error in identify-strain:", error);
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    return new Response(
      JSON.stringify({ error: "Unable to process your request. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
