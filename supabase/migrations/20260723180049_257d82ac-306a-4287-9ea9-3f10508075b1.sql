
-- Force initial status to 'pending' on insert
CREATE OR REPLACE FUNCTION public.force_delivery_order_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

-- Enforce delivery fee based on distance_km tiers, and recompute total
CREATE OR REPLACE FUNCTION public.enforce_delivery_order_financials()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_fee numeric;
  km numeric;
BEGIN
  km := COALESCE(NEW.distance_km, 0);
  IF km <= 5 THEN computed_fee := 30;
  ELSIF km <= 10 THEN computed_fee := 50;
  ELSIF km <= 20 THEN computed_fee := 80;
  ELSIF km <= 40 THEN computed_fee := 120;
  ELSE computed_fee := 180;
  END IF;

  NEW.delivery_fee := computed_fee;
  NEW.subtotal := COALESCE(NEW.subtotal, 0);
  NEW.total := COALESCE(NEW.subtotal, 0) + computed_fee;
  RETURN NEW;
END;
$$;

-- Enforce unit_price from tenant_strains and recompute total_price
CREATE OR REPLACE FUNCTION public.enforce_delivery_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authoritative_price numeric;
BEGIN
  SELECT price INTO authoritative_price
  FROM public.tenant_strains
  WHERE id = NEW.strain_id;

  IF authoritative_price IS NULL THEN
    RAISE EXCEPTION 'Invalid strain_id: no catalog price found';
  END IF;

  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  NEW.unit_price := authoritative_price;
  NEW.total_price := authoritative_price * NEW.quantity;
  RETURN NEW;
END;
$$;

-- After an item is inserted/updated/deleted, recompute parent order totals
CREATE OR REPLACE FUNCTION public.recompute_delivery_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_order uuid;
  new_subtotal numeric;
  order_fee numeric;
BEGIN
  target_order := COALESCE(NEW.order_id, OLD.order_id);
  SELECT COALESCE(SUM(total_price), 0) INTO new_subtotal
  FROM public.delivery_order_items WHERE order_id = target_order;

  SELECT delivery_fee INTO order_fee
  FROM public.delivery_orders WHERE id = target_order;

  UPDATE public.delivery_orders
  SET subtotal = new_subtotal,
      total = new_subtotal + COALESCE(order_fee, 0),
      updated_at = now()
  WHERE id = target_order;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_force_delivery_order_pending ON public.delivery_orders;
CREATE TRIGGER trg_force_delivery_order_pending
BEFORE INSERT ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.force_delivery_order_pending();

DROP TRIGGER IF EXISTS trg_enforce_delivery_order_financials ON public.delivery_orders;
CREATE TRIGGER trg_enforce_delivery_order_financials
BEFORE INSERT OR UPDATE ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_order_financials();

DROP TRIGGER IF EXISTS trg_enforce_delivery_item_price ON public.delivery_order_items;
CREATE TRIGGER trg_enforce_delivery_item_price
BEFORE INSERT OR UPDATE ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_item_price();

DROP TRIGGER IF EXISTS trg_recompute_delivery_order_totals ON public.delivery_order_items;
CREATE TRIGGER trg_recompute_delivery_order_totals
AFTER INSERT OR UPDATE OR DELETE ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.recompute_delivery_order_totals();
