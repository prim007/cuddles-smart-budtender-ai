-- Fix 1: Add RESTRICTIVE UPDATE policy on user_roles to block non-admin updates
CREATE POLICY "Deny non-admin role updates"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add RESTRICTIVE DELETE policy for non-admins
CREATE POLICY "Deny non-admin role deletions"
ON public.user_roles AS RESTRICTIVE
FOR DELETE TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Recreate strain_reviews_public view WITH security_invoker
DROP VIEW IF EXISTS public.strain_reviews_public;
CREATE VIEW public.strain_reviews_public
WITH (security_invoker = true)
AS SELECT id, strain_name, strain_type, rating, title, review_text,
  effects, pros, cons, helpful_count, verified_purchase, created_at
FROM strain_reviews;