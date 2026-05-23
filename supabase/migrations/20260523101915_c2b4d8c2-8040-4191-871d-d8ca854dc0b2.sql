DROP POLICY IF EXISTS "Users can update own pending orders" ON public.delivery_orders;

CREATE POLICY "Users can update own pending orders"
ON public.delivery_orders
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) AND (status = 'pending'))
WITH CHECK (
  (auth.uid() = user_id)
  AND (status IN ('pending', 'cancelled'))
);