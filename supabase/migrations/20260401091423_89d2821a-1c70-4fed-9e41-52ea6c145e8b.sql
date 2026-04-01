
-- Fix: Tighten admin policies on tenants table from {public} to {authenticated}
-- This prevents any theoretical unauthenticated access via admin policies

DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
CREATE POLICY "Admins can view all tenants" ON public.tenants
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update all tenants" ON public.tenants;
CREATE POLICY "Admins can update all tenants" ON public.tenants
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete all tenants" ON public.tenants;
CREATE POLICY "Admins can delete all tenants" ON public.tenants
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
