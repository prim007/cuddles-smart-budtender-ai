
ALTER TABLE public.email_leads ADD COLUMN promo_code text UNIQUE;

UPDATE public.email_leads
SET promo_code = 'CUDDLES-' || UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE promo_code IS NULL;
