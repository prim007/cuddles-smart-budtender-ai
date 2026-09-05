import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const TEMPLATE = 'article-approved'
const BLOG_URL = 'https://www.cuddles-ai.com/blog'

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
  if (userError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  // Admin-only action
  const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
    _user_id: user.id,
    _role: 'admin',
  })
  if (roleError || !isAdmin) {
    return json({ error: 'Forbidden' }, 403)
  }

  let submissionId: string
  try {
    const body = await req.json()
    submissionId = typeof body?.submissionId === 'string' ? body.submissionId : ''
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400)
  }
  if (!submissionId) {
    return json({ error: 'submissionId is required' }, 400)
  }

  // All recipient facts come from the database, never the browser.
  const { data: submission, error: fetchError } = await supabase
    .from('article_submissions')
    .select('id, author_name, author_email, title, status')
    .eq('id', submissionId)
    .maybeSingle()

  if (fetchError || !submission) {
    return json({ error: 'Submission not found' }, 404)
  }
  if (submission.status === 'approved') {
    return json({ ok: true, alreadyApproved: true })
  }

  const { error: updateError } = await supabase
    .from('article_submissions')
    .update({ status: 'approved' })
    .eq('id', submission.id)

  if (updateError) {
    console.error('Failed to approve submission', updateError)
    return json({ error: 'Failed to approve submission' }, 500)
  }

  const recipient = submission.author_email
  try {
    const result = await sendTemplateEmail(TEMPLATE, recipient, {
      idempotencyKey: `article-approved-${submission.id}`,
      templateData: {
        name: submission.author_name,
        title: submission.title,
        blogUrl: BLOG_URL,
      },
    })

    if (!result.sent) {
      await logSend(supabase, recipient, 'suppressed')
      return json({ ok: true, approved: true, email: 'suppressed' })
    }

    await logSend(supabase, recipient, 'sent')
    return json({ ok: true, approved: true, email: 'sent' })
  } catch (error) {
    console.error('Failed to send article approval email', error)
    await logSend(supabase, recipient, 'failed', error instanceof Error ? error.message : 'unknown')
    // The approval itself succeeded — report the email failure separately.
    return json({ ok: true, approved: true, email: 'failed' }, 200)
  }
})
