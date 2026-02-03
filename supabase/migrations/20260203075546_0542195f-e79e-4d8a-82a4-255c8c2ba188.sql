-- Add explicit RESTRICTIVE INSERT deny policy for non-admin users on user_roles
-- This prevents any privilege escalation attempts
CREATE POLICY "Deny non-admin role insertions"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));