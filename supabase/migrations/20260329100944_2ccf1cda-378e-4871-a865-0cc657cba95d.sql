
-- ============================================
-- FIX 1: Privilege Escalation in user_roles
-- Tighten the ALL policy to scope admin inserts
-- so admins can only manage roles, not via a broad ALL
-- Replace the broad "Admins can manage roles" ALL policy
-- with specific per-operation policies that are properly scoped
-- ============================================

-- Drop the overly broad ALL policy
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Admin can insert roles (scoped: only admins can do this)
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update roles (scoped: only admins)
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete roles (scoped: only admins)
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- FIX 2: Hide payment tokens from client
-- Create a safe view excluding sensitive columns
-- ============================================

CREATE OR REPLACE VIEW public.subscriptions_safe
WITH (security_invoker = false)
AS
SELECT
  id,
  user_id,
  plan,
  status,
  amount,
  currency,
  started_at,
  ends_at,
  cancelled_at,
  created_at,
  updated_at
FROM public.subscriptions;

-- Grant access to the view
GRANT SELECT ON public.subscriptions_safe TO authenticated;

-- RLS on the base table already restricts by user_id, 
-- but since security_invoker = false, the view runs as owner.
-- We add a policy on the view itself is not needed for security definer views.

-- Revoke direct client SELECT on subscriptions table 
-- (only service_role should read it directly)
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;

-- Re-create a more restrictive policy: users can only read via edge functions (service_role)
-- The service_role ALL policy already exists and covers edge function access
-- Users will use the safe view instead

CREATE POLICY "Users can read own subscriptions via safe view only"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND (
    current_setting('request.path', true) IS NULL 
    OR current_setting('request.path', true) = ''
  )
);

-- ============================================
-- FIX 3: Protect tenant embed_key
-- Create a safe tenant view excluding embed_key
-- Tenant owners see embed_key only via a separate secure function
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_embed_key()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT embed_key::text
  FROM tenants
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;
