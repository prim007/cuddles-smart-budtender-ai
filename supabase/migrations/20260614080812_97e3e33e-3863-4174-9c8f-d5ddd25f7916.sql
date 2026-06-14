-- Normalize any unexpected statuses to 'pending' before adding the check
UPDATE public.delivery_orders
SET status = 'pending'
WHERE status IS NULL
   OR status NOT IN ('pending','confirmed','preparing','on_the_way','delivered','cancelled');

ALTER TABLE public.delivery_orders
  ADD CONSTRAINT delivery_orders_status_check
  CHECK (status IN ('pending','confirmed','preparing','on_the_way','delivered','cancelled'));

-- Force new orders to start as 'pending' regardless of client-supplied value
CREATE OR REPLACE FUNCTION public.force_delivery_order_pending_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_force_delivery_order_pending ON public.delivery_orders;
CREATE TRIGGER trg_force_delivery_order_pending
BEFORE INSERT ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.force_delivery_order_pending_on_insert();