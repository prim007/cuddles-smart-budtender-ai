
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit articles" ON public.article_submissions;

-- Replace with a more specific policy that ensures status is always 'pending'
CREATE POLICY "Anyone can submit articles with pending status"
ON public.article_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');
