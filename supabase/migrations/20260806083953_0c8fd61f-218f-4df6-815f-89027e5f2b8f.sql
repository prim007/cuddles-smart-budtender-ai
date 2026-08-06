CREATE OR REPLACE FUNCTION public.force_tenant_signup_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  NEW.user_id := COALESCE(auth.uid(), NEW.user_id);
  NEW.plan := 'standard';
  NEW.plan_price := 150000;
  NEW.status := 'trial';
  NEW.embed_key := gen_random_uuid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_force_tenant_signup_defaults ON public.tenants;
CREATE TRIGGER trg_force_tenant_signup_defaults
BEFORE INSERT ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.force_tenant_signup_defaults();