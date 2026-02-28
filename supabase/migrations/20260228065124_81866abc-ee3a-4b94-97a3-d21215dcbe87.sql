
-- Tenant-specific strain catalogs
CREATE TABLE public.tenant_strains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category text NOT NULL,
  strain_name text NOT NULL,
  strain_type text NOT NULL DEFAULT 'Hybrid',
  primary_terpene text,
  secondary_terpene text,
  primary_effect text,
  notes text,
  thc_min numeric,
  thc_max numeric,
  cbd_min numeric,
  cbd_max numeric,
  price numeric,
  in_stock boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, strain_name)
);

-- Enable RLS
ALTER TABLE public.tenant_strains ENABLE ROW LEVEL SECURITY;

-- Tenant owners can manage their own strains
CREATE POLICY "Tenants can view own strains"
  ON public.tenant_strains FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

CREATE POLICY "Tenants can insert own strains"
  ON public.tenant_strains FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

CREATE POLICY "Tenants can update own strains"
  ON public.tenant_strains FOR UPDATE
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

CREATE POLICY "Tenants can delete own strains"
  ON public.tenant_strains FOR DELETE
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

-- Admins can manage all
CREATE POLICY "Admins can manage all tenant strains"
  ON public.tenant_strains FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public read via embed_key (for the widget edge function - read by anyone with valid embed_key)
CREATE POLICY "Public read for active tenants"
  ON public.tenant_strains FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE status IN ('trial', 'active'))
  );

-- Auto-update timestamps
CREATE TRIGGER update_tenant_strains_updated_at
  BEFORE UPDATE ON public.tenant_strains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
