import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'
import { rateLimitResponse } from '../_shared/rate-limit.ts'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo'
const NEWSLETTER_LIST_ID = 3

const SignupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  website: z.string().max(0).optional().default(''),
})

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const limited = rateLimitResponse(
    req,
    { scope: 'newsletter-subscribe', max: 8, windowMs: 60 * 60_000 },
    corsHeaders,
  )
  if (limited) return limited

  const parsed = SignupSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: 'Please enter a valid email address.' }, 400)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const brevoKey = Deno.env.get('BREVO_API_KEY')
  if (!supabaseUrl || !serviceKey || !lovableKey || !brevoKey) {
    console.error('newsletter-subscribe: required service configuration is missing')
    return json({ error: 'Subscriptions are temporarily unavailable. Please try again later.' }, 503)
  }

  const admin = createClient(supabaseUrl, serviceKey)
  const email = parsed.data.email

  const { data: suppressed, error: suppressionError } = await admin
    .from('suppressed_emails')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (suppressionError) {
    console.error('newsletter-subscribe: suppression check failed', suppressionError.code)
    return json({ error: 'Subscriptions are temporarily unavailable. Please try again later.' }, 503)
  }
  if (suppressed) {
    return json({ error: 'This address previously opted out. Please contact us if you would like to rejoin.' }, 409)
  }

  const { error: subscriberError } = await admin
    .from('newsletter_subscribers')
    .upsert({ email, status: 'confirmed', updated_at: new Date().toISOString() }, { onConflict: 'email' })

  if (subscriberError) {
    console.error('newsletter-subscribe: subscriber save failed', subscriberError.code)
    return json({ error: 'We could not save your subscription. Please try again.' }, 500)
  }

  const response = await fetch(`${GATEWAY_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': brevoKey,
    },
    body: JSON.stringify({
      email,
      listIds: [NEWSLETTER_LIST_ID],
      updateEnabled: true,
      emailBlacklisted: false,
      attributes: { SOURCE: 'newsletter_page' },
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    console.error('newsletter-subscribe: Brevo contact update failed', response.status, details)
    await admin.from('newsletter_subscribers').update({ status: 'pending' }).eq('email', email)
    return json({ error: 'We could not finish your subscription. Please try again.' }, 502)
  }

  return json({ success: true }, 200)
})