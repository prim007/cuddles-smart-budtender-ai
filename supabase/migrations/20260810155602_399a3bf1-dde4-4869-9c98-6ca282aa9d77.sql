ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS intent text;

CREATE TABLE public.chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  helpful boolean,
  feedback_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.chat_feedback TO authenticated;
GRANT ALL ON public.chat_feedback TO service_role;
GRANT SELECT, UPDATE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;

ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own chat feedback"
ON public.chat_feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chat feedback"
ON public.chat_feedback FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage chat feedback"
ON public.chat_feedback FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_intent ON public.chat_conversations(intent);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_session_id ON public.chat_feedback(session_id);
