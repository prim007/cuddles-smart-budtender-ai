CREATE TABLE public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  source text,
  content_hash text NOT NULL,
  embedding vector(768),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX knowledge_documents_content_hash_key ON public.knowledge_documents (content_hash);
CREATE INDEX knowledge_documents_category_idx ON public.knowledge_documents (category);
CREATE INDEX knowledge_documents_embedding_idx ON public.knowledge_documents USING hnsw (embedding vector_cosine_ops);

GRANT SELECT ON public.knowledge_documents TO anon;
GRANT SELECT ON public.knowledge_documents TO authenticated;
GRANT ALL ON public.knowledge_documents TO service_role;

ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge is publicly readable"
  ON public.knowledge_documents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert knowledge"
  ON public.knowledge_documents FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update knowledge"
  ON public.knowledge_documents FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete knowledge"
  ON public.knowledge_documents FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_knowledge_documents_updated_at
  BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(768),
  match_count integer DEFAULT 6,
  min_similarity double precision DEFAULT 0.15
)
RETURNS TABLE (
  id uuid,
  category text,
  title text,
  content text,
  source text,
  similarity double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT k.id, k.category, k.title, k.content, k.source,
         1 - (k.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_documents k
  WHERE k.embedding IS NOT NULL
    AND 1 - (k.embedding <=> query_embedding) >= min_similarity
  ORDER BY k.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;

GRANT EXECUTE ON FUNCTION public.match_knowledge(vector, integer, double precision) TO anon, authenticated, service_role;