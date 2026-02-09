
CREATE TABLE public.article_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.article_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an article
CREATE POLICY "Anyone can submit articles"
ON public.article_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view/manage submissions
CREATE POLICY "Admins can manage submissions"
ON public.article_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
