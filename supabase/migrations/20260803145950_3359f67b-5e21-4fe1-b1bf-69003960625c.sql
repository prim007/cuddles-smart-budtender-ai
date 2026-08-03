CREATE OR REPLACE FUNCTION public.protect_delivery_order_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  NEW.user_id := OLD.user_id;
  NEW.total := OLD.total;
  NEW.subtotal := OLD.subtotal;
  NEW.delivery_fee := OLD.delivery_fee;
  NEW.delivery_address := OLD.delivery_address;
  NEW.delivery_lat := OLD.delivery_lat;
  NEW.delivery_lng := OLD.delivery_lng;
  NEW.distance_km := OLD.distance_km;
  NEW.estimated_delivery_minutes := OLD.estimated_delivery_minutes;
  NEW.driver_notes := OLD.driver_notes;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_delivery_item_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  authoritative_price numeric;
  item_in_stock boolean;
  order_status text;
  order_owner uuid;
  authoritative_name text;
BEGIN
  SELECT status, user_id INTO order_status, order_owner
  FROM public.delivery_orders
  WHERE id = NEW.order_id;

  IF order_status IS NULL THEN
    RAISE EXCEPTION 'Invalid order_id';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    IF order_owner IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'You can only modify items on your own order';
    END IF;
    IF order_status <> 'pending' THEN
      RAISE EXCEPTION 'Order items can only be modified while the order is pending';
    END IF;
  END IF;

  SELECT price, in_stock, strain_name
    INTO authoritative_price, item_in_stock, authoritative_name
  FROM public.tenant_strains
  WHERE id = NEW.strain_id;

  IF authoritative_price IS NULL THEN
    RAISE EXCEPTION 'Invalid strain_id: no catalog price found';
  END IF;

  IF item_in_stock IS DISTINCT FROM true AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Selected product is not available';
  END IF;

  IF NEW.quantity IS NULL OR NEW.quantity <= 0 OR NEW.quantity > 100 THEN
    RAISE EXCEPTION 'Quantity must be between 1 and 100';
  END IF;

  NEW.strain_name := authoritative_name;
  NEW.unit_price := authoritative_price;
  NEW.total_price := authoritative_price * NEW.quantity;
  RETURN NEW;
END;
$function$;