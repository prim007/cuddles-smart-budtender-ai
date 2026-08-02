CREATE TABLE IF NOT EXISTS public.internal_hook_secrets (
  name text PRIMARY KEY,
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.internal_hook_secrets TO service_role;

ALTER TABLE public.internal_hook_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to internal hook secrets"
ON public.internal_hook_secrets
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);