
-- Attach server-side price/financial enforcement triggers so client-supplied
-- prices in checkout cannot be trusted.

DROP TRIGGER IF EXISTS trg_enforce_delivery_item_price_ins ON public.delivery_order_items;
DROP TRIGGER IF EXISTS trg_enforce_delivery_item_price_upd ON public.delivery_order_items;
DROP TRIGGER IF EXISTS trg_recompute_delivery_order_totals_ins ON public.delivery_order_items;
DROP TRIGGER IF EXISTS trg_recompute_delivery_order_totals_upd ON public.delivery_order_items;
DROP TRIGGER IF EXISTS trg_recompute_delivery_order_totals_del ON public.delivery_order_items;
DROP TRIGGER IF EXISTS trg_enforce_delivery_order_financials_ins ON public.delivery_orders;
DROP TRIGGER IF EXISTS trg_enforce_delivery_order_financials_upd ON public.delivery_orders;
DROP TRIGGER IF EXISTS trg_force_delivery_order_pending_ins ON public.delivery_orders;

-- Recompute per-item unit_price/total_price from tenant_strains on insert & update
CREATE TRIGGER trg_enforce_delivery_item_price_ins
BEFORE INSERT ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_item_price();

CREATE TRIGGER trg_enforce_delivery_item_price_upd
BEFORE UPDATE ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_item_price();

-- Recompute order subtotal/total whenever items change
CREATE TRIGGER trg_recompute_delivery_order_totals_ins
AFTER INSERT ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.recompute_delivery_order_totals();

CREATE TRIGGER trg_recompute_delivery_order_totals_upd
AFTER UPDATE ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.recompute_delivery_order_totals();

CREATE TRIGGER trg_recompute_delivery_order_totals_del
AFTER DELETE ON public.delivery_order_items
FOR EACH ROW EXECUTE FUNCTION public.recompute_delivery_order_totals();

-- Recompute delivery_fee/total from distance_km on order insert/update
CREATE TRIGGER trg_enforce_delivery_order_financials_ins
BEFORE INSERT ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_order_financials();

CREATE TRIGGER trg_enforce_delivery_order_financials_upd
BEFORE UPDATE ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_order_financials();

-- Force status='pending' on new orders regardless of client input
CREATE TRIGGER trg_force_delivery_order_pending_ins
BEFORE INSERT ON public.delivery_orders
FOR EACH ROW EXECUTE FUNCTION public.force_delivery_order_pending_on_insert();
