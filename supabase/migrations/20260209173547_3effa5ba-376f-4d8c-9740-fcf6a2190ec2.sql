
-- Drop the overly broad ALL policy and replace with specific admin policies
DROP POLICY "Admins can manage all tenants" ON public.tenants;

CREATE POLICY "Admins can update all tenants" ON public.tenants
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all tenants" ON public.tenants
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
