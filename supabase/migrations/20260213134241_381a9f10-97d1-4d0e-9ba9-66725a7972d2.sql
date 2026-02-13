-- Recreate strain_reviews_public view WITHOUT security_invoker
-- This allows public read access while the view already excludes sensitive user_id field
DROP VIEW IF EXISTS public.strain_reviews_public;

CREATE VIEW public.strain_reviews_public
WITH (security_invoker = false)
AS
SELECT
  id,
  strain_name,
  strain_type,
  rating,
  title,
  review_text,
  effects,
  pros,
  cons,
  helpful_count,
  verified_purchase,
  created_at
FROM strain_reviews;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.strain_reviews_public TO anon;
GRANT SELECT ON public.strain_reviews_public TO authenticated;
