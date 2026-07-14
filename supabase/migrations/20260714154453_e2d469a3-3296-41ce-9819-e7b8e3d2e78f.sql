-- Remove misnamed permissive policies that actually GRANT insert/update/delete
-- to anon/authenticated on every bucket except email-assets. service_role
-- bypasses RLS, so no permissive write policies are needed for it.
DROP POLICY IF EXISTS "Only service role can upload email assets" ON storage.objects;
DROP POLICY IF EXISTS "Only service role can update email assets" ON storage.objects;
DROP POLICY IF EXISTS "Only service role can delete email assets" ON storage.objects;