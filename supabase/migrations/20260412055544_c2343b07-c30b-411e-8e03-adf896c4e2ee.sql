-- Drop the overly permissive public read policy that exposes user_id
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.strain_reviews;