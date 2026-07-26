DROP TRIGGER IF EXISTS enforce_delivery_item_price_trg ON public.delivery_order_items;

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
BEGIN
  SELECT status INTO order_status
  FROM public.delivery_orders
  WHERE id = NEW.order_id;

  IF order_status IS NULL THEN
    RAISE EXCEPTION 'Invalid order_id';
  END IF;

  IF order_status <> 'pending' AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Order items can only be modified while the order is pending';
  END IF;

  SELECT price, in_stock INTO authoritative_price, item_in_stock
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

  NEW.unit_price := authoritative_price;
  NEW.total_price := authoritative_price * NEW.quantity;
  RETURN NEW;
END;
$function$;