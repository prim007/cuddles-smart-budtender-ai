-- Enable pgvector for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to tenant_strains (768 dims = good default for sentence-transformers / Gemini embed)
ALTER TABLE public.tenant_strains
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- IVFFlat index for fast cosine similarity
CREATE INDEX IF NOT EXISTS tenant_strains_embedding_idx
  ON public.tenant_strains
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Similarity search function: returns top-k in-stock strains for a tenant
CREATE OR REPLACE FUNCTION public.match_strains(
  query_embedding vector(768),
  p_tenant_id uuid DEFAULT NULL,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  strain_name text,
  strain_type text,
  category text,
  primary_effect text,
  primary_terpene text,
  price numeric,
  similarity float
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ts.id,
    ts.tenant_id,
    ts.strain_name,
    ts.strain_type,
    ts.category,
    ts.primary_effect,
    ts.primary_terpene,
    ts.price,
    1 - (ts.embedding <=> query_embedding) AS similarity
  FROM public.tenant_strains ts
  JOIN public.tenants t ON t.id = ts.tenant_id
  WHERE ts.embedding IS NOT NULL
    AND ts.in_stock = true
    AND t.status IN ('trial', 'active')
    AND (p_tenant_id IS NULL OR ts.tenant_id = p_tenant_id)
  ORDER BY ts.embedding <=> query_embedding
  LIMIT match_count;
$$;