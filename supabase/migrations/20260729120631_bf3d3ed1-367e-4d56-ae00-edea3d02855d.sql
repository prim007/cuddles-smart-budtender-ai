CREATE TABLE public.ui_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  ideas text[] NOT NULL DEFAULT '{}',
  note text,
  path text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.ui_feedback TO anon;
GRANT INSERT, SELECT ON public.ui_feedback TO authenticated;
GRANT ALL ON public.ui_feedback TO service_role;

ALTER TABLE public.ui_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit UI feedback"
ON public.ui_feedback FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND char_length(coalesce(note, '')) <= 500
  AND array_length(ideas, 1) IS DISTINCT FROM 0
);

CREATE POLICY "Admins can read UI feedback"
ON public.ui_feedback FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));