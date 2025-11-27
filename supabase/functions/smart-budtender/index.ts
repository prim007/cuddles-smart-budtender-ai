import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in smart-budtender function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
