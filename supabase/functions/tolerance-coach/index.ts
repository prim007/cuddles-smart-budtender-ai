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
    const { action, dayNumber, targetDays, mood, symptoms, reason } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = `You are Cuddles, a supportive and encouraging tolerance break coach. Your role is to:
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
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
      throw new Error("Failed to get coaching response");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Keep going! You're doing great! 💪";

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in tolerance-coach:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
