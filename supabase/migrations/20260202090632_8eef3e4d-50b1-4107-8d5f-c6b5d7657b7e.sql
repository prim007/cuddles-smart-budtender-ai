-- Drop existing permissive INSERT policy for chat_conversations
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_conversations;

-- Create rate-limited INSERT policy for chat_conversations
-- Allows max 10 messages per minute per session
CREATE POLICY "Rate limited chat insertions"
ON public.chat_conversations
FOR INSERT
WITH CHECK (
  (
    SELECT COUNT(*)
    FROM public.chat_conversations
    WHERE session_id = chat_conversations.session_id
    AND created_at > NOW() - INTERVAL '1 minute'
  ) < 10
);

-- Drop existing permissive INSERT policy for demo_requests
DROP POLICY IF EXISTS "Anyone can submit demo requests" ON public.demo_requests;

-- Create rate-limited INSERT policy for demo_requests
-- Allows max 3 submissions per hour per email
CREATE POLICY "Rate limited demo submissions"
ON public.demo_requests
FOR INSERT
WITH CHECK (
  (
    SELECT COUNT(*)
    FROM public.demo_requests
    WHERE email = demo_requests.email
    AND created_at > NOW() - INTERVAL '1 hour'
  ) < 3
);