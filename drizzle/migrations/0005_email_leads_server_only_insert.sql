DROP POLICY IF EXISTS "Allow email signups" ON public.email_leads;
DROP POLICY IF EXISTS "Allow email signups with rate limit" ON public.email_leads;
REVOKE INSERT ON public.email_leads FROM anon, authenticated;
GRANT ALL ON public.email_leads TO service_role;