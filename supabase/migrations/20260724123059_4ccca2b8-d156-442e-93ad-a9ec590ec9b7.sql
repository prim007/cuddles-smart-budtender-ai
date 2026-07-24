
DROP POLICY IF EXISTS "Users can update own tenant" ON public.tenants;
CREATE POLICY "Users can update own tenant" ON public.tenants
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan = (SELECT plan FROM public.tenants t WHERE t.id = tenants.id)
  AND plan_price IS NOT DISTINCT FROM (SELECT plan_price FROM public.tenants t WHERE t.id = tenants.id)
  AND status = (SELECT status FROM public.tenants t WHERE t.id = tenants.id)
  AND embed_key = (SELECT embed_key FROM public.tenants t WHERE t.id = tenants.id)
);

DROP POLICY IF EXISTS "Tenants can update own strains" ON public.tenant_strains;
CREATE POLICY "Tenants can update own strains" ON public.tenant_strains
FOR UPDATE TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()))
WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));
