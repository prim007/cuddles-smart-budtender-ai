
-- Attach server-side triggers so delivery order prices cannot be tampered with by the client.

DROP TRIGGER IF EXISTS trg_force_delivery_order_pending ON public.delivery_orders;
CREATE TRIGGER trg_force_delivery_order_pending
BEFORE INSERT ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.force_delivery_order_pending_on_insert();

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
