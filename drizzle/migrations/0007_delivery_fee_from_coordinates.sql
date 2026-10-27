CREATE OR REPLACE FUNCTION public.enforce_delivery_order_financials()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  computed_fee numeric;
  computed_subtotal numeric;
  km numeric;
  shop_lat constant numeric := -33.9249;
  shop_lng constant numeric := 18.4241;
BEGIN
  -- Distance is derived on the server from the delivery pin, never trusted
  -- from the caller. Without a pin the top band applies.
  IF NEW.delivery_lat IS NULL OR NEW.delivery_lng IS NULL THEN
    km := NULL;
    computed_fee := 180;
  ELSE
    km := round((6371 * 2 * asin(sqrt(
      power(sin(radians((NEW.delivery_lat - shop_lat) / 2)), 2) +
      cos(radians(shop_lat)) * cos(radians(NEW.delivery_lat)) *
      power(sin(radians((NEW.delivery_lng - shop_lng) / 2)), 2)
    )))::numeric, 2);
    IF km <= 5 THEN computed_fee := 30;
    ELSIF km <= 10 THEN computed_fee := 50;
    ELSIF km <= 20 THEN computed_fee := 80;
    ELSIF km <= 40 THEN computed_fee := 120;
    ELSE computed_fee := 180;
    END IF;
  END IF;

  SELECT COALESCE(SUM(total_price), 0) INTO computed_subtotal
  FROM public.delivery_order_items WHERE order_id = NEW.id;

  NEW.distance_km := km;
  NEW.delivery_fee := computed_fee;
  NEW.subtotal := computed_subtotal;
  NEW.total := computed_subtotal + computed_fee;
  RETURN NEW;
END;
$$;