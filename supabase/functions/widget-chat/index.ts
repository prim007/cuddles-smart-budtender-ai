import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Input validation ---
function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) return { valid: false, error: 'Messages must be an array' };
  if (messages.length === 0) return { valid: false, error: 'Messages cannot be empty' };
  if (messages.length > 50) return { valid: false, error: 'Too many messages (max 50)' };
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') return { valid: false, error: `Invalid message at ${i}` };
    if (!['user', 'assistant'].includes(msg.role)) return { valid: false, error: `Invalid role at ${i}` };
    if (typeof msg.content !== 'string' || msg.content.length > 5000) return { valid: false, error: `Invalid content at ${i}` };
  }
  return { valid: true };
}

// --- Rate limiting ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (record.count >= 30) return false;
  record.count++;
  return true;
}

// --- Base system prompt ---
const BASE_SYSTEM_PROMPT = `You are Cuddles, a warm, emotionally intelligent cannabis AI assistant embedded on a dispensary website. Your role is to provide educational information about cannabis and help customers find the right products.

IMPORTANT RULES:
- Provide GENERAL EDUCATIONAL INFORMATION ONLY
- Always clarify that effects vary between individuals
- Emphasize "start low and go slow" for dosing
- Be warm, friendly, and emotionally attuned
- Never make medical claims

STRAIN RECOMMENDATION DATABASE:

SLEEP: Northern Lights (Indica, Myrcene/Caryophyllene), Granddaddy Purple (Indica, Linalool/Myrcene), Purple Punch (Indica, Caryophyllene/Limonene), Afghan Kush (Indica, Myrcene/Pinene), 9 Pound Hammer (Indica, Myrcene/Caryophyllene), Bubba Kush (Indica, Caryophyllene/Limonene)

CREATIVITY: Blue Dream (Hybrid, Myrcene/Pinene), Jack Herer (Sativa, Terpinolene/Pinene), Chemdawg (Hybrid, Caryophyllene/Limonene), Super Silver Haze (Sativa, Limonene/Myrcene), Amnesia Haze (Sativa, Myrcene/Limonene), Chocolope (Sativa, Myrcene/Caryophyllene)

PAIN RELIEF: ACDC (Hybrid CBD, Myrcene/Pinene), Harlequin (Hybrid CBD, Myrcene/Caryophyllene), Blackberry Kush (Indica, Myrcene/Limonene), Cannatonic (Hybrid CBD, Myrcene/Linalool), White Widow (Hybrid, Myrcene/Caryophyllene), LA Confidential (Indica, Myrcene/Pinene)

SOCIAL: Super Lemon Haze (Sativa, Terpinolene/Caryophyllene), Pineapple Express (Hybrid, Caryophyllene/Limonene), Tangie (Sativa, Myrcene/Limonene), Gelato (Hybrid, Caryophyllene/Limonene), Laughing Buddha (Sativa, Myrcene/Caryophyllene)

STRESS: OG Kush (Hybrid, Myrcene/Limonene), GSC (Hybrid, Caryophyllene/Limonene), Pennywise (Indica CBD, Myrcene/Caryophyllene), Wedding Cake (Hybrid, Limonene/Caryophyllene), Hindu Kush (Indica, Caryophyllene/Limonene)

ENERGY: Durban Poison (Sativa, Terpinolene/Myrcene), Green Crack (Sativa, Myrcene/Caryophyllene), Sour Diesel (Sativa, Caryophyllene/Limonene), Strawberry Cough (Sativa, Myrcene/Pinene)

When a customer seems ready to purchase, add "[ORDER:PHONE]" at the end (the system replaces PHONE with the dispensary's number).`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, embedKey } = await req.json();

    if (!embedKey || typeof embedKey !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing embed key' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit by embed key
    if (!checkRateLimit(embedKey)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up tenant
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('id, business_name, phone, branding_color, status')
      .eq('embed_key', embedKey)
      .single();

    if (tenantErr || !tenant) {
      return new Response(JSON.stringify({ error: 'Invalid embed key' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['trial', 'active'].includes(tenant.status)) {
      return new Response(JSON.stringify({ error: 'Subscription inactive' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch tenant-specific strains
    const { data: tenantStrains } = await supabase
      .from('tenant_strains')
      .select('category, strain_name, strain_type, primary_terpene, secondary_terpene, primary_effect, notes, thc_min, thc_max, price, in_stock')
      .eq('tenant_id', tenant.id)
      .eq('in_stock', true);

    // Build tenant-specific system prompt
    let systemPrompt = BASE_SYSTEM_PROMPT;
    systemPrompt += `\n\nYou are embedded on ${tenant.business_name}'s website.`;

    if (tenant.phone) {
      systemPrompt = systemPrompt.replace('[ORDER:PHONE]', `[ORDER:${tenant.phone}]`);
    }

    if (tenantStrains && tenantStrains.length > 0) {
      systemPrompt += `\n\n${tenant.business_name.toUpperCase()}'S CURRENT MENU (PRIORITIZE THESE):\n`;
      const grouped: Record<string, typeof tenantStrains> = {};
      for (const s of tenantStrains) {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s);
      }
      for (const [cat, strains] of Object.entries(grouped)) {
        systemPrompt += `\n${cat.toUpperCase()}:\n`;
        for (const s of strains) {
          let line = `- ${s.strain_name} (${s.strain_type})`;
          if (s.primary_terpene) line += ` — ${s.primary_terpene}`;
          if (s.secondary_terpene) line += `/${s.secondary_terpene}`;
          if (s.price) line += ` — $${s.price}`;
          if (s.notes) line += ` — ${s.notes}`;
          systemPrompt += line + '\n';
        }
      }
      systemPrompt += `\nWhen recommending strains, ALWAYS check ${tenant.business_name}'s menu first. Only suggest from the general database if the menu doesn't have a match.`;
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Unable to process request' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Widget chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
