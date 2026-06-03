DROP POLICY IF EXISTS "Public can read strain reviews" ON public.strain_reviews;
REVOKE SELECT ON public.strain_reviews FROM anon;
GRANT SELECT ON public.strain_reviews_public TO anon, authenticated;