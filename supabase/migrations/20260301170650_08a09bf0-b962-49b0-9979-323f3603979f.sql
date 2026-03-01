-- Drop the restrictive policy and replace with a permissive one that allows anonymous inserts with rate limiting
DROP POLICY IF EXISTS "Rate limited email submissions" ON public.email_leads;

CREATE POLICY "Allow email signups with rate limit"
ON public.email_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (check_email_rate_limit(email));