-- user_memory: long-term personalization for the recommendation agent
CREATE TABLE public.user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  last_recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own memory"
  ON public.user_memory FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own memory"
  ON public.user_memory FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own memory"
  ON public.user_memory FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages memory"
  ON public.user_memory FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER user_memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- agent_traces: observability log for agent runs
CREATE TABLE public.agent_traces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  user_id uuid,
  agent_role text NOT NULL,
  step_index integer NOT NULL DEFAULT 0,
  tool_called text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb,
  tokens_in integer,
  tokens_out integer,
  latency_ms integer,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read agent traces"
  ON public.agent_traces FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role writes agent traces"
  ON public.agent_traces FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_agent_traces_session ON public.agent_traces(session_id, created_at DESC);
CREATE INDEX idx_agent_traces_user ON public.agent_traces(user_id, created_at DESC);