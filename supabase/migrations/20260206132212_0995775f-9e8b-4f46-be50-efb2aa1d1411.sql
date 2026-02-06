-- Create a public view for strain_reviews that excludes user_id
CREATE VIEW public.strain_reviews_public
WITH (security_invoker=on) AS
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
FROM public.strain_reviews;

-- Drop the existing "Anyone can view reviews" policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.strain_reviews;

-- Create a new policy that only allows authenticated users to view their own reviews directly
CREATE POLICY "Users can view own reviews directly"
  ON public.strain_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Admin policy for full access (if not exists, add it)
CREATE POLICY "Admins can view all reviews"
  ON public.strain_reviews FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));