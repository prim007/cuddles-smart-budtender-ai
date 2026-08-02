-- 1. Delivery orders: enforce financial invariants via BEFORE UPDATE trigger (OLD vs NEW)
CREATE OR REPLACE FUNCTION public.protect_delivery_order_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Ownership can never be reassigned by a non-admin
  NEW.user_id := OLD.user_id;

  -- Financial + logistics fields are server-owned
  NEW.total := OLD.total;
  NEW.subtotal := OLD.subtotal;
  NEW.delivery_fee := OLD.delivery_fee;
  NEW.delivery_address := OLD.delivery_address;
  NEW.delivery_lat := OLD.delivery_lat;
  NEW.delivery_lng := OLD.delivery_lng;
  NEW.distance_km := OLD.distance_km;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_delivery_order_fields ON public.delivery_orders;
CREATE TRIGGER trg_protect_delivery_order_fields
BEFORE UPDATE ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.protect_delivery_order_fields();

-- The old restrictive policy was a no-op (self-subquery sees new row state)
DROP POLICY IF EXISTS "Users cannot modify financial fields" ON public.delivery_orders;

-- 2. Tenants: enforce plan/billing invariants via BEFORE UPDATE trigger
CREATE OR REPLACE FUNCTION public.protect_tenant_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.plan_price IS DISTINCT FROM OLD.plan_price
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.embed_key IS DISTINCT FROM OLD.embed_key
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Plan, billing, status, ownership and embed key cannot be changed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_tenant_fields ON public.tenants;
CREATE TRIGGER trg_protect_tenant_fields
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.protect_tenant_fields();

-- Replace the ineffective self-subquery WITH CHECK with a simple ownership check
DROP POLICY IF EXISTS "Users can update own tenant" ON public.tenants;
CREATE POLICY "Users can update own tenant"
ON public.tenants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);