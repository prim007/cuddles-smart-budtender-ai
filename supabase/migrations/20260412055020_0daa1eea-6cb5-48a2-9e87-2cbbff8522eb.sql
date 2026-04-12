-- Remove the overly broad "Anyone can read reviews" policy that exposes user_id
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.strain_reviews;

-- Add a policy so authenticated users can still read their own reviews (already exists but ensuring coverage)
-- The strain_reviews_public view (which excludes user_id) handles all public/anonymous reads