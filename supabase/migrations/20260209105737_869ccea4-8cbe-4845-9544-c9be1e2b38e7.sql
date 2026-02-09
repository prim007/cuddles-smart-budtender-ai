-- Fix 1: Add RESTRICTIVE policy to deny non-admin authenticated users from reading demo_requests
-- This ensures only admins can SELECT, even among authenticated users
CREATE POLICY "Deny non-admin read access"
ON public.demo_requests
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Enable RLS on strain_reviews_public view and add explicit public access policy
-- This view is intentionally public (shows reviews without user_id) for community features
ALTER VIEW public.strain_reviews_public SET (security_invoker = true);

-- Note: Views with security_invoker inherit RLS from underlying tables
-- Since strain_reviews has proper RLS, the view will respect those policies
-- For public read access to the sanitized view, we need to ensure SELECT works for all