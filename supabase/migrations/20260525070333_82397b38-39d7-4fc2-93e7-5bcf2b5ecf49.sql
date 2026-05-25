
-- Server-side recompute of delivery_fee on delivery_orders
CREATE OR REPLACE FUNCTION public.enforce_delivery_order_financials()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_fee numeric;
BEGIN
  -- Distance-based fee: base 30 ZAR + 10 ZAR/km, clamped to [30, 180]
  IF NEW.distance_km IS NULL THEN
    v_fee := 30;
  ELSE
    v_fee := GREATEST(30, LEAST(180, 30 + (NEW.distance_km * 10)));
  END IF;

  NEW.delivery_fee := v_fee;
  -- subtotal/total will be recomputed by item trigger; start at fee
  IF TG_OP = 'INSERT' THEN
    NEW.subtotal := COALESCE(NEW.subtotal, 0);
    NEW.total := COALESCE(NEW.subtotal, 0) + v_fee;
  ELSE
    NEW.total := COALESCE(NEW.subtotal, 0) + v_fee;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_delivery_order_financials ON public.delivery_orders;
CREATE TRIGGER trg_enforce_delivery_order_financials
BEFORE INSERT OR UPDATE ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_order_financials();

-- Recompute parent order subtotal/total from actual items
CREATE OR REPLACE FUNCTION public.recompute_delivery_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_subtotal numeric;
  v_fee numeric;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO v_subtotal
  FROM public.delivery_order_items
  WHERE order_id = v_order_id;

  SELECT delivery_fee INTO v_fee FROM public.delivery_orders WHERE id = v_order_id;

  UPDATE public.delivery_orders
  SET subtotal = v_subtotal,
      total = v_subtotal + COALESCE(v_fee, 0)
  WHERE id = v_order_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_delivery_order_totals ON public.delivery_order_items;
CREATE TRIGGER trg_recompute_delivery_order_totals
AFTER INSERT OR UPDATE OR DELETE ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.recompute_delivery_order_totals();
