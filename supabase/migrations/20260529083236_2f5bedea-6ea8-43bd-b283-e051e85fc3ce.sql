
CREATE OR REPLACE FUNCTION public.enforce_delivery_item_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price numeric;
  v_name text;
BEGIN
  SELECT price, strain_name INTO v_price, v_name
  FROM public.tenant_strains
  WHERE id = NEW.strain_id;

  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Invalid or unpriced strain_id: %', NEW.strain_id;
  END IF;

  IF NEW.quantity IS NULL OR NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be >= 1';
  END IF;

  NEW.unit_price := v_price;
  NEW.total_price := v_price * NEW.quantity;
  NEW.strain_name := COALESCE(v_name, NEW.strain_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_delivery_item_price_trg ON public.delivery_order_items;
CREATE TRIGGER enforce_delivery_item_price_trg
BEFORE INSERT OR UPDATE ON public.delivery_order_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_delivery_item_price();
