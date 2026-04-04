-- Restrict uploads to service_role only
CREATE POLICY "Only service role can upload email assets"
ON storage.objects
FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id != 'email-assets');

-- Restrict updates to service_role only
CREATE POLICY "Only service role can update email assets"
ON storage.objects
FOR UPDATE
TO authenticated, anon
USING (bucket_id != 'email-assets');

-- Restrict deletes to service_role only
CREATE POLICY "Only service role can delete email assets"
ON storage.objects
FOR DELETE
TO authenticated, anon
USING (bucket_id != 'email-assets');