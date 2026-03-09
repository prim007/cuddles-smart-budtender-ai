
ALTER TABLE public.email_leads ADD COLUMN used boolean NOT NULL DEFAULT false;
ALTER TABLE public.email_leads ADD COLUMN used_at timestamp with time zone;
