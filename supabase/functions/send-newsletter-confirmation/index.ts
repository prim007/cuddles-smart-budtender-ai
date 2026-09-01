import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const CANONICAL_ORIGIN = 'https://www.cuddles-ai.com'
const TEMPLATE = 'newsletter-confirmation'

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function logSend(
  supabase: ReturnType<typeof createClient>,
  recipient: string,
  status: 'sent' | 'suppressed' | 'failed',
  errorMessage?: string,
) {
  const { error } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: TEMPLATE,
    recipient_email: recipient,
    status,
    error_message: errorMessage ?? null,
  })
  if (error) {
    console.error('Failed to write email_send_log', { code: error.code, message: error.message })
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return json({ error: 'Server configuration error' }, 500)
  }

  let email: string
  try {
    const body = await req.json()
    email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400)
  }

  if (!email || email.length > 320 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'A valid email is required' }, 400)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Only send to an address that legitimately signed up and is still pending.
  const { data: subscriber, error: lookupError } = await supabase
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('email', email)
    .maybeSingle()

  if (lookupError || !subscriber || subscriber.status !== 'pending') {
    // Generic response — never leak list membership.
    return json({ success: true, sent: false })
  }

  // Rate-limit: at most one confirmation per recipient per hour.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('email_send_log')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_email', email)
    .eq('template_name', TEMPLATE)
    .gte('created_at', oneHourAgo)

  if ((count ?? 0) >= 1) {
    return json({ success: true, sent: false, reason: 'rate_limited' })
  }

  try {
    const result = await sendTemplateEmail(TEMPLATE, email, {
      idempotencyKey: `newsletter-confirm-${subscriber.id}`,
      templateData: {
        name: 'Friend',
        confirmationUrl: `${CANONICAL_ORIGIN}/newsletter/confirm?token=${subscriber.id}`,
      },
    })

    if (!result.sent) {
      await logSend(supabase, email, 'suppressed')
      return json({ success: true, sent: false, reason: 'recipient_suppressed' })
    }

    await logSend(supabase, email, 'sent')
    return json({ success: true, sent: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Newsletter confirmation send failed', { message })
    await logSend(supabase, email, 'failed', message)
    return json({ error: 'Failed to send confirmation email' }, 500)
  }
})
