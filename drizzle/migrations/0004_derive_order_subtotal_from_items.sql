CREATE OR REPLACE FUNCTION public.enforce_delivery_order_financials()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  computed_fee numeric;
  computed_subtotal numeric;
  km numeric;
BEGIN
  km := COALESCE(NEW.distance_km, 0);
  IF km <= 5 THEN computed_fee := 30;
  ELSIF km <= 10 THEN computed_fee := 50;
  ELSIF km <= 20 THEN computed_fee := 80;
  ELSIF km <= 40 THEN computed_fee := 120;
  ELSE computed_fee := 180;
  END IF;

  SELECT COALESCE(SUM(total_price), 0) INTO computed_subtotal
  FROM public.delivery_order_items WHERE order_id = NEW.id;

  NEW.delivery_fee := computed_fee;
  NEW.subtotal := computed_subtotal;
  NEW.total := computed_subtotal + computed_fee;
  RETURN NEW;
END;
$$;