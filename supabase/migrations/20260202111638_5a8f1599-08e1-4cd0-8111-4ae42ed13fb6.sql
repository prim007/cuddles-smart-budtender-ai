-- Fix rate limiting policy for demo_requests - the current policy has a bug
-- It compares demo_requests_1.email = demo_requests_1.email (always true)
-- Should compare to the incoming email being inserted

DROP POLICY IF EXISTS "Rate limited demo submissions" ON public.demo_requests;

CREATE POLICY "Rate limited demo submissions"
ON public.demo_requests
FOR INSERT
TO public
WITH CHECK (
  (SELECT count(*) 
   FROM demo_requests existing
   WHERE existing.email = email 
     AND existing.created_at > (now() - interval '1 hour')
  ) < 3
);

-- Fix rate limiting policy for chat_conversations - same bug
-- Also add additional protection by limiting total messages per session

DROP POLICY IF EXISTS "Rate limited chat insertions" ON public.chat_conversations;

-- Rate limit: max 10 messages per minute per session AND max 100 messages total per session
CREATE POLICY "Rate limited chat insertions"
ON public.chat_conversations
FOR INSERT
TO public
WITH CHECK (
  -- Limit per minute per session
  (SELECT count(*) 
   FROM chat_conversations existing
   WHERE existing.session_id = session_id 
     AND existing.created_at > (now() - interval '1 minute')
  ) < 10
  AND
  -- Total session limit to prevent abuse
  (SELECT count(*) 
   FROM chat_conversations existing
   WHERE existing.session_id = session_id
  ) < 100
);