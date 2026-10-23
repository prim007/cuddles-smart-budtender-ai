DROP POLICY IF EXISTS "See own shares" ON public.shared_items;
CREATE POLICY "See own shares" ON public.shared_items FOR SELECT TO authenticated
USING ((auth.uid() = sender_id OR auth.uid() = recipient_id) AND public.are_connected(sender_id, recipient_id));