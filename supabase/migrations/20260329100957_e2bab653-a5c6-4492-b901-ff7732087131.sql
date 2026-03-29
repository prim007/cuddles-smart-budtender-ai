
-- Fix the subscriptions_safe view to use security_invoker = true
-- The base subscriptions table already has RLS that restricts by user_id
-- so the view can safely use invoker's permissions
DROP VIEW IF EXISTS public.subscriptions_safe;

CREATE VIEW public.subscriptions_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  plan,
  status,
  amount,
  currency,
  started_at,
  ends_at,
  cancelled_at,
  created_at,
  updated_at
FROM public.subscriptions;

GRANT SELECT ON public.subscriptions_safe TO authenticated;

-- Also fix: drop the overly complex policy and use a simple one
DROP POLICY IF EXISTS "Users can read own subscriptions via safe view only" ON public.subscriptions;

-- Restore simple user read policy (needed for security_invoker view to work)
CREATE POLICY "Users can read own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
