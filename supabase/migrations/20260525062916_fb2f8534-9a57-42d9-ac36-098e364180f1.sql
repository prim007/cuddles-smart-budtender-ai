
-- 1. Newsletter subscribers: restrictive policy denying non-admin reads
CREATE POLICY "Only admins can read subscribers"
ON public.newsletter_subscribers
AS RESTRICTIVE
FOR SELECT
TO authenticated, anon
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Delivery orders: tighten user UPDATE to prevent altering financial/address/user_id fields
DROP POLICY IF EXISTS "Users can update own pending orders" ON public.delivery_orders;

CREATE POLICY "Users can update own pending orders"
ON public.delivery_orders
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) AND (status = 'pending'::text))
WITH CHECK (
  auth.uid() = user_id
  AND status = ANY (ARRAY['pending'::text, 'cancelled'::text])
);

-- Restrictive policy: forbid mutation of sensitive columns by non-admins
CREATE POLICY "Users cannot modify financial fields"
ON public.delivery_orders
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    user_id = (SELECT d.user_id FROM public.delivery_orders d WHERE d.id = delivery_orders.id)
    AND delivery_address = (SELECT d.delivery_address FROM public.delivery_orders d WHERE d.id = delivery_orders.id)
    AND total = (SELECT d.total FROM public.delivery_orders d WHERE d.id = delivery_orders.id)
    AND subtotal = (SELECT d.subtotal FROM public.delivery_orders d WHERE d.id = delivery_orders.id)
    AND delivery_fee = (SELECT d.delivery_fee FROM public.delivery_orders d WHERE d.id = delivery_orders.id)
    AND COALESCE(delivery_lat::text, '') = COALESCE((SELECT d.delivery_lat::text FROM public.delivery_orders d WHERE d.id = delivery_orders.id), '')
    AND COALESCE(delivery_lng::text, '') = COALESCE((SELECT d.delivery_lng::text FROM public.delivery_orders d WHERE d.id = delivery_orders.id), '')
    AND COALESCE(distance_km::text, '') = COALESCE((SELECT d.distance_km::text FROM public.delivery_orders d WHERE d.id = delivery_orders.id), '')
  )
);
