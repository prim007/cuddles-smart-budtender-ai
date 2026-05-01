CREATE TABLE IF NOT EXISTS public.agent_trace_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating IN (-1, 1)),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, reviewer_id)
);

ALTER TABLE public.agent_trace_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read feedback" ON public.agent_trace_feedback;
CREATE POLICY "Admins read feedback"
  ON public.agent_trace_feedback FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins insert feedback" ON public.agent_trace_feedback;
CREATE POLICY "Admins insert feedback"
  ON public.agent_trace_feedback FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Admins update own feedback" ON public.agent_trace_feedback;
CREATE POLICY "Admins update own feedback"
  ON public.agent_trace_feedback FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) AND reviewer_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_agent_traces_created_at ON public.agent_traces(created_at DESC);