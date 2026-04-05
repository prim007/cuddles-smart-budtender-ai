-- Drop the broken permissive policies
DROP POLICY IF EXISTS "Only service role can upload email assets" ON storage.objects;
DROP POLICY IF EXISTS "Only service role can update email assets" ON storage.objects;
DROP POLICY IF EXISTS "Only service role can delete email assets" ON storage.objects;

-- Create RESTRICTIVE policies that deny anon/authenticated from writing to email-assets
CREATE POLICY "Deny anon/auth insert on email-assets"
ON storage.objects
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id != 'email-assets');

CREATE POLICY "Deny anon/auth update on email-assets"
ON storage.objects
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (bucket_id != 'email-assets');

CREATE POLICY "Deny anon/auth delete on email-assets"
ON storage.objects
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (bucket_id != 'email-assets');