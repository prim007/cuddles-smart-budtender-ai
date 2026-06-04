-- Switch the public reviews view off security_invoker so anonymous/authenticated
-- callers can read community reviews through it without exposing user_id on the
-- base table.
ALTER VIEW public.strain_reviews_public SET (security_invoker = false);

GRANT SELECT ON public.strain_reviews_public TO anon, authenticated;