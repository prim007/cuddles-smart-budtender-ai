import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { rateLimitResponse } from '../_shared/rate-limit.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const rl = rateLimitResponse(req, { scope: 'confirm-newsletter', max: 20, windowMs: 60_000 }, corsHeaders)
  if (rl) return rl

  try {
    const { token } = await req.json()
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Server configuration error')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if the token (id) exists and is pending
    const { data: subscriber, error: lookupError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('id', token)
      .maybeSingle()

    if (lookupError || !subscriber) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (subscriber.status === 'confirmed') {
      return new Response(JSON.stringify({ success: true, already_confirmed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update status to confirmed
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'confirmed' })
      .eq('id', token)

    if (updateError) {
      throw updateError
    }

    // Only now, after the owner confirmed, add the address to the Brevo list.
    const { data: suppressed } = await supabase
      .from('suppressed_emails').select('id').eq('email', subscriber.email).maybeSingle()
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')
    const brevoKey = Deno.env.get('BREVO_API_KEY')
    if (!suppressed && lovableKey && brevoKey) {
      const res = await fetch('https://connector-gateway.lovable.dev/brevo/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': brevoKey,
        },
        body: JSON.stringify({
          email: subscriber.email,
          listIds: [3],
          updateEnabled: true,
          emailBlacklisted: false,
          attributes: { SOURCE: 'newsletter_page' },
        }),
      })
      if (!res.ok) console.error('confirm-newsletter: Brevo contact update failed', res.status)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error confirming subscription:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
