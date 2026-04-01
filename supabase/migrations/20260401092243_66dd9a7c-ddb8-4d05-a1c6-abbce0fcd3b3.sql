-- Allow public read access to strain_reviews so the security_invoker view works for anonymous/public users
CREATE POLICY "Anyone can read reviews"
ON public.strain_reviews
FOR SELECT TO public
USING (true);