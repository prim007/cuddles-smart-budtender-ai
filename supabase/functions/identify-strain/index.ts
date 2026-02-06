import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze image");
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
          description: content,
          effects: [],
          similar_strains: []
        };
      }
    } catch {
      strainData = {
        strain_name: "Unknown",
        confidence: 0,
        strain_type: "unknown",
        description: content,
        characteristics: [],
        effects: [],
        similar_strains: []
      };
    }

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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
