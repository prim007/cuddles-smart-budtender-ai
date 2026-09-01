import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const TEMPLATE = 't-break-milestone'
const REWARD_CODE = 'TBREAK15'
const APP_URL = 'https://www.cuddles-ai.com/t-break'

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

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  const user = userData?.user
  if (userError || !user?.email) {
    return json({ error: 'Unauthorized' }, 401)
  }

  let breakId: string
  let dayNumber: number
  let completed: boolean
  try {
    const body = await req.json()
    breakId = typeof body?.breakId === 'string' ? body.breakId : ''
    dayNumber = Number(body?.dayNumber)
    completed = Boolean(body?.completed)
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400)
  }

  if (!breakId || !Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 365) {
    return json({ error: 'breakId and a valid dayNumber are required' }, 400)
  }

  // Recipient and milestone facts come from trusted data, never the browser.
  const { data: brk, error: breakError } = await supabase
    .from('tolerance_breaks')
    .select('id, user_id, target_days')
    .eq('id', breakId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (breakError || !brk) {
    return json({ error: 'Tolerance break not found' }, 404)
  }

  const recipient = user.email
  const key = completed ? 'completed' : `day${dayNumber}`

  try {
    const result = await sendTemplateEmail(TEMPLATE, recipient, {
      idempotencyKey: `tbreak-${brk.id}-${key}`,
      templateData: {
        milestone: completed ? 'the finish line' : `day ${dayNumber}`,
        dayNumber,
        targetDays: brk.target_days,
        completed,
        ...(completed ? { rewardCode: REWARD_CODE } : {}),
        appUrl: APP_URL,
      },
    })

    if (!result.sent) {
      await logSend(supabase, recipient, 'suppressed')
      return json({ success: true, sent: false, reason: 'recipient_suppressed' })
    }

    await logSend(supabase, recipient, 'sent')
    return json({ success: true, sent: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('T-break milestone send failed', { message })
    await logSend(supabase, recipient, 'failed', message)
    return json({ error: 'Failed to send milestone email' }, 500)
  }
})
