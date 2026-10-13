CREATE TABLE public.image_gateway_state (
  id text PRIMARY KEY DEFAULT 'image-studio' CHECK (id = 'image-studio'),
  paused boolean NOT NULL DEFAULT false,
  status integer,
  reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.image_gateway_state TO service_role;
REVOKE ALL ON public.image_gateway_state FROM anon, authenticated;
ALTER TABLE public.image_gateway_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.image_gateway_state IS 'Service-only persistent circuit breaker for image generation; no browser access.';