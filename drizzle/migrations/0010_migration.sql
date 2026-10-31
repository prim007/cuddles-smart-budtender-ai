-- Topic-only record of questions asked through a shop's website chat.
-- No message text, visitor IDs or IPs are stored: only which broad topics
-- a question touched, so shops can see what their customers ask each week.
CREATE TABLE public.widget_topic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  topics text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.widget_topic_events TO service_role;

ALTER TABLE public.widget_topic_events ENABLE ROW LEVEL SECURITY;
-- No client policies: only server code writes and reads these records.

CREATE INDEX idx_widget_topic_events_tenant_created
  ON public.widget_topic_events (tenant_id, created_at DESC);