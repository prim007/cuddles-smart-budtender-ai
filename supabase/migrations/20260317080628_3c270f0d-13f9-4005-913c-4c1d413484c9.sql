
-- Fix 1: Tighten chat_conversations INSERT policy
DROP POLICY IF EXISTS "Allow chat insertions" ON public.chat_conversations;
CREATE POLICY "Allow chat insertions" ON public.chat_conversations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND user_message IS NOT NULL
    AND assistant_message IS NOT NULL
    AND length(user_message) > 0
    AND length(user_message) <= 5000
    AND length(assistant_message) > 0
    AND length(assistant_message) <= 10000
  );

-- Fix 2: Tighten demo_requests INSERT policy
DROP POLICY IF EXISTS "Allow demo submissions" ON public.demo_requests;
CREATE POLICY "Allow demo submissions" ON public.demo_requests
  FOR INSERT TO public
  WITH CHECK (
    name IS NOT NULL AND length(name) > 0 AND length(name) <= 200
    AND email IS NOT NULL AND length(email) > 0 AND length(email) <= 320
    AND company IS NOT NULL AND length(company) > 0 AND length(company) <= 200
    AND store_count IS NOT NULL AND length(store_count) > 0
    AND status = 'pending'
  );

-- Fix 3: Tighten email_leads INSERT policy
DROP POLICY IF EXISTS "Allow email signups" ON public.email_leads;
CREATE POLICY "Allow email signups" ON public.email_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) > 0
    AND length(email) <= 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
