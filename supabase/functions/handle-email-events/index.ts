import { createEmailWebhookHandler } from 'npm:@lovable.dev/email-js@0.1.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function client() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Notification-only bookkeeping: Lovable enforces suppression server-side.
// These rows keep the project's own history tables up to date.
async function record(
  recipient: string,
  reason: 'bounce' | 'complaint' | 'unsubscribe',
  logStatus: 'bounced' | 'complained' | 'suppressed',
  logMessage: string,
  eventId: string,
) {
  const supabase = client()
  const email = recipient.toLowerCase()

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })

  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      event_id: eventId,
      code: suppressError.code,
      message: suppressError.message,
    })
    throw new Error('Failed to write suppression')
  }

  const { error: logError } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: 'system',
    recipient_email: email,
    status: logStatus,
    error_message: logMessage,
    metadata: null,
  })

  if (logError) {
    console.error('Failed to insert email_send_log', {
      event_id: eventId,
      code: logError.code,
      message: logError.message,
    })
    throw new Error('Failed to write email send log')
  }
}

const handler = createEmailWebhookHandler({
  apiKey: Deno.env.get('LOVABLE_API_KEY')!,
  on: {
    'email.bounced': async (event) => {
      await record(
        event.data.recipient,
        'bounce',
        'bounced',
        'Permanent bounce — email address is invalid or rejected',
        event.event_id,
      )
    },
    'email.complaint': async (event) => {
      await record(
        event.data.recipient,
        'complaint',
        'complained',
        'Spam complaint — recipient marked email as spam',
        event.event_id,
      )
    },
    'email.unsubscribed': async (event) => {
      await record(
        event.data.recipient,
        'unsubscribe',
        'suppressed',
        'Recipient unsubscribed',
        event.event_id,
      )
    },
  },
})

Deno.serve((req) => handler(req))
