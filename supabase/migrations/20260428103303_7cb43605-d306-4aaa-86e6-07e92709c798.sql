-- Remove public SELECT policy that exposes user_id on strain_reviews.
-- Public reads should go through the strain_reviews_public view which excludes user_id.
DROP POLICY IF EXISTS "Anyone can view strain reviews" ON public.strain_reviews;

-- Ensure the public view stays accessible (it uses security_invoker; grant SELECT to anon/authenticated)
GRANT SELECT ON public.strain_reviews_public TO anon, authenticated;