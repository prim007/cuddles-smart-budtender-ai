-- 1. Remove blanket public SELECT on strain_reviews that exposed user_id
DROP POLICY IF EXISTS "Public can read strain reviews" ON public.strain_reviews;

-- 2. Lock down delivery_order_items: deny UPDATE/DELETE for non-admins
CREATE POLICY "Deny customer updates to order items"
ON public.delivery_order_items
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny customer deletes of order items"
ON public.delivery_order_items
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update order items"
ON public.delivery_order_items
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete order items"
ON public.delivery_order_items
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));