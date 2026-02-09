
-- Add a PERMISSIVE SELECT policy so anyone can read reviews for the community feature
-- This works alongside the existing RESTRICTIVE policies because PERMISSIVE policies
-- are evaluated separately (any permissive = allowed, then all restrictive must pass)
CREATE POLICY "Anyone can view reviews publicly"
ON public.strain_reviews
FOR SELECT
TO anon, authenticated
USING (true);
