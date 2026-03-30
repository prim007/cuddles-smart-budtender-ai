
-- FIX 1: Recreate subscriptions_safe view with security_invoker
DROP VIEW IF EXISTS public.subscriptions_safe;

CREATE VIEW public.subscriptions_safe
WITH (security_invoker = true)
AS
SELECT
  id, user_id, plan, status, amount, currency,
  started_at, ends_at, cancelled_at, created_at, updated_at
FROM public.subscriptions;

GRANT SELECT ON public.subscriptions_safe TO authenticated;
REVOKE ALL ON public.subscriptions_safe FROM anon;

-- FIX 2: Deny authenticated users from writing to subscriptions
-- (service_role bypasses RLS entirely, so it's unaffected)

CREATE POLICY "Deny direct subscription inserts"
ON public.subscriptions
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny direct subscription updates"
ON public.subscriptions
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny direct subscription deletes"
ON public.subscriptions
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);
