
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Rate limited chat insertions" ON public.chat_conversations;

-- Create a new INSERT policy that allows both anonymous and authenticated users
-- while keeping rate limiting for safety
CREATE POLICY "Rate limited chat insertions"
ON public.chat_conversations
FOR INSERT
TO anon, authenticated
WITH CHECK (check_chat_rate_limit(session_id));
