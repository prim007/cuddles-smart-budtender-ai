-- Allow public read of community strain reviews via the sanitized view (no user_id exposed)
CREATE POLICY "Public can read strain reviews"
ON public.strain_reviews
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.strain_reviews_public TO anon, authenticated;