import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts';

const SITE_URL = 'https://www.cuddles-ai.com';

async function sendConfirmation(rawEmail: string) {
  const email = rawEmail.toLowerCase().trim();
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  // Throttle: at most 3 confirmation emails per address per hour.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('email_unsubscribe_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', since);
  if ((count ?? 0) >= 3) return;

  // Only email addresses we have actually sent mail to or that signed up — never arbitrary strangers.
  const [sub, lead, sent] = await Promise.all([
    admin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('email', email),
    admin.from('email_leads').select('id', { count: 'exact', head: true }).eq('email', email),
    admin.from('email_send_log').select('id', { count: 'exact', head: true }).eq('recipient_email', email),
  ]);
  if (!(sub.count || lead.count || sent.count)) return;

  // Global ceiling: at most 200 confirmation emails per hour across all addresses.
  const { count: globalCount } = await admin
    .from('email_unsubscribe_tokens')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);
  if ((globalCount ?? 0) >= 200) return;

  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const { error } = await admin.from('email_unsubscribe_tokens').insert({ token, email });
  if (error) {
    console.error('Failed to store unsubscribe token', error.message);
    return;
  }
  try {
    await sendTemplateEmail('unsubscribe-confirm', email, {
      templateData: { unsubscribeUrl: `${SITE_URL}/unsubscribe?token=${token}` },
      idempotencyKey: `unsubscribe-confirm-${token}`,
    });
  } catch (e) {
    console.error('Failed to send unsubscribe confirmation', e);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 255;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

/**
 * Resolve WHICH address the caller is actually allowed to unsubscribe.
 * Two proofs are accepted, nothing else:
 *   1. A single-use token issued by us and emailed to that address.
 *   2. A signed-in user unsubscribing their own account address.
 * A bare email address is never sufficient — otherwise anyone could opt
 * anyone else out of their mail.
 */
async function resolveEmail(
  req: Request,
  token: string | null,
  requestedEmail: string | null,
): Promise<{ email: string } | { error: string; status: number }> {
  const admin = createClient(supabaseUrl, serviceKey);

  if (token) {
    if (typeof token !== 'string' || token.length < 16 || token.length > 256) {
      return { error: 'This unsubscribe link is not valid.', status: 400 };
    }
    const { data: row } = await admin
      .from('email_unsubscribe_tokens')
      .select('token, email, used_at')
      .eq('token', token)
      .maybeSingle();

    if (!row) return { error: 'This unsubscribe link is not valid or has expired.', status: 403 };
    if (row.used_at) {
      return { error: 'This unsubscribe link has already been used. You are unsubscribed.', status: 410 };
    }
    const { data: claimed } = await admin
      .from('email_unsubscribe_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)
      .is('used_at', null)
      .select('token')
      .maybeSingle();
    if (!claimed) {
      return { error: 'This unsubscribe link has already been used. You are unsubscribed.', status: 410 };
    }
    return { email: String(row.email) };
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  // The publishable/anon key is also sent as a bearer token by the JS client,
  // so only treat a real user JWT as a credential.
  if (jwt && jwt !== anonKey && jwt.length > 100) {
    const authed = createClient(supabaseUrl, anonKey);
    const { data } = await authed.auth.getUser(jwt);
    const accountEmail = data?.user?.email;
    if (accountEmail) {
      if (
        requestedEmail &&
        requestedEmail.toLowerCase().trim() !== accountEmail.toLowerCase().trim()
      ) {
        return {
          error: 'You can only unsubscribe the address on your own account. Use the link in the email instead.',
          status: 403,
        };
      }
      return { email: accountEmail };
    }
  }

  return {
    error: 'Use the unsubscribe link in your email, or sign in to unsubscribe your own address.',
    status: 401,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let email: string | null = null;
    let token: string | null = url.searchParams.get('token');

    if (req.method === 'GET') {
      email = url.searchParams.get('email');
    } else if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => ({}));
        email = typeof body?.email === 'string' ? body.email : null;
        token = token ?? (typeof body?.token === 'string' ? body.token : null);
      } else {
        // RFC 8058 one-click: List-Unsubscribe=One-Click form post
        const form = await req.formData().catch(() => null);
        email = (form?.get('email') as string | null) ?? url.searchParams.get('email');
        token = token ?? ((form?.get('token') as string | null) ?? null);
      }
    } else {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (email !== null && !isEmail(email)) {
      return json({ error: 'A valid email address is required' }, 400);
    }

    const resolved = await resolveEmail(req, token, email);
    if ('error' in resolved) {
      // Anonymous visitor typing an address: email that address a one-time
      // confirmation link instead of opting it out directly.
      if (resolved.status === 401 && email && !token) {
        await sendConfirmation(email);
        return json({ success: true, pending: true }, 200);
      }
      return json({ error: resolved.error }, resolved.status);
    }
    if (!isEmail(resolved.email)) return json({ error: 'A valid email address is required' }, 400);

    await suppress(resolved.email);

    return json({ success: true, email: resolved.email.toLowerCase().trim() }, 200);
  } catch (error) {
    console.error('handle-email-unsubscribe error', error);
    return json({ error: 'Unsubscribe failed. Please try again.' }, 500);
  }
});
