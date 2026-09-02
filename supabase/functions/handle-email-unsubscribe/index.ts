import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 255;
}

async function suppress(email: string) {
  const supabase = createClient(supabaseUrl, serviceKey);
  const normalized = email.toLowerCase().trim();

  const { error } = await supabase
    .from('suppressed_emails')
    .upsert({ email: normalized, reason: 'unsubscribe', metadata: null }, { onConflict: 'email' });

  if (error) {
    console.error('Failed to suppress email', { code: error.code, message: error.message });
    throw new Error('Failed to record unsubscribe');
  }

  // Best-effort: also mark newsletter subscription inactive if present.
  await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('email', normalized);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let email: string | null = null;

    if (req.method === 'GET') {
      email = new URL(req.url).searchParams.get('email');
    } else if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => ({}));
        email = typeof body?.email === 'string' ? body.email : null;
      } else {
        // RFC 8058 one-click: List-Unsubscribe=One-Click form post
        const form = await req.formData().catch(() => null);
        email = (form?.get('email') as string | null) ?? new URL(req.url).searchParams.get('email');
      }
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isEmail(email)) {
      return new Response(JSON.stringify({ error: 'A valid email address is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await suppress(email);

    return new Response(JSON.stringify({ success: true, email: email.toLowerCase().trim() }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('handle-email-unsubscribe error', error);
    return new Response(JSON.stringify({ error: 'Unsubscribe failed. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
