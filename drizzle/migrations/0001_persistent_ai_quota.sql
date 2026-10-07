CREATE TABLE public.ai_usage_quota (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

GRANT ALL ON public.ai_usage_quota TO service_role;

ALTER TABLE public.ai_usage_quota ENABLE ROW LEVEL SECURITY;
-- No policies: only backend functions (service role) can read or write.

CREATE OR REPLACE FUNCTION public.consume_ai_quota(p_bucket text, p_limit integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_count integer;
BEGIN
  IF p_bucket IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  v_window := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);

  INSERT INTO public.ai_usage_quota AS q (bucket, window_start, count)
  VALUES (p_bucket, v_window, 1)
  ON CONFLICT (bucket, window_start)
  DO UPDATE SET count = q.count + 1
  WHERE q.count < p_limit
  RETURNING q.count INTO v_count;

  -- Occasional housekeeping of expired windows.
  IF random() < 0.01 THEN
    DELETE FROM public.ai_usage_quota WHERE window_start < now() - interval '2 days';
  END IF;

  RETURN v_count IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(text, integer, integer) TO service_role;