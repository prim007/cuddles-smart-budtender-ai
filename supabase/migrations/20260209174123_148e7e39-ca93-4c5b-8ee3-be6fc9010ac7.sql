
-- Deny anonymous read access to tenants table
CREATE POLICY "Deny anonymous read access" ON public.tenants
  FOR SELECT USING (false);

-- Deny anonymous read access to demo_requests (adding explicit deny for anon)
-- Note: "Deny anonymous read access" already exists on demo_requests, but let's verify
-- The existing policy uses USING(false) which is correct. Skip demo_requests.
