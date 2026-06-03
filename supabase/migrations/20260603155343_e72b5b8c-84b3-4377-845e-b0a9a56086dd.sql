
CREATE TABLE public.ab_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  user_id uuid,
  experiment text NOT NULL,
  variant text NOT NULL,
  event_name text NOT NULL,
  path text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX ab_events_exp_variant_event_idx ON public.ab_events (experiment, variant, event_name, created_at DESC);
CREATE INDEX ab_events_session_idx ON public.ab_events (session_id);

GRANT INSERT ON public.ab_events TO anon, authenticated;
GRANT SELECT ON public.ab_events TO authenticated;
GRANT ALL ON public.ab_events TO service_role;

ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ab events"
ON public.ab_events FOR INSERT TO anon, authenticated
WITH CHECK (
  length(session_id) BETWEEN 1 AND 100
  AND length(experiment) BETWEEN 1 AND 60
  AND length(variant) BETWEEN 1 AND 60
  AND length(event_name) BETWEEN 1 AND 60
);

CREATE POLICY "Admins read ab events"
ON public.ab_events FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon read ab events"
ON public.ab_events AS RESTRICTIVE FOR SELECT TO anon
USING (false);
