-- Drop the existing broken rate limiting policy
DROP POLICY IF EXISTS "Rate limited chat insertions" ON public.chat_conversations;

-- Create a proper rate limiting policy that references the new row correctly
-- Using NEW reference via a function for proper comparison
CREATE OR REPLACE FUNCTION public.check_chat_rate_limit(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    -- Max 10 messages per minute per session
    (SELECT count(*) FROM chat_conversations 
     WHERE session_id = p_session_id 
     AND created_at > (now() - interval '1 minute')) < 10
    AND
    -- Max 100 messages total per session
    (SELECT count(*) FROM chat_conversations 
     WHERE session_id = p_session_id) < 100
  )
$$;

-- Create properly structured rate limiting policy
CREATE POLICY "Rate limited chat insertions"
ON public.chat_conversations
AS RESTRICTIVE
FOR INSERT
WITH CHECK (check_chat_rate_limit(session_id));

-- Add text length constraints to prevent abuse via huge messages
ALTER TABLE public.chat_conversations
ADD CONSTRAINT check_message_length 
CHECK (
  char_length(user_message) <= 5000 
  AND char_length(assistant_message) <= 50000
);

-- Also fix the rate limiting policies for email_leads and demo_requests which have the same bug
DROP POLICY IF EXISTS "Rate limited email submissions" ON public.email_leads;
DROP POLICY IF EXISTS "Rate limited demo submissions" ON public.demo_requests;

-- Create helper functions for rate limiting
CREATE OR REPLACE FUNCTION public.check_email_rate_limit(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT count(*) FROM email_leads 
    WHERE email = p_email 
    AND created_at > (now() - interval '1 hour')
  ) < 3
$$;

CREATE OR REPLACE FUNCTION public.check_demo_rate_limit(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT count(*) FROM demo_requests 
    WHERE email = p_email 
    AND created_at > (now() - interval '1 hour')
  ) < 3
$$;

-- Create properly structured rate limiting policies
CREATE POLICY "Rate limited email submissions"
ON public.email_leads
AS RESTRICTIVE
FOR INSERT
WITH CHECK (check_email_rate_limit(email));

CREATE POLICY "Rate limited demo submissions"
ON public.demo_requests
AS RESTRICTIVE
FOR INSERT
WITH CHECK (check_demo_rate_limit(email));