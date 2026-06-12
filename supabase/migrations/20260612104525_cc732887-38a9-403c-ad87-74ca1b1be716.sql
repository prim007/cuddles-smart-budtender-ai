CREATE OR REPLACE FUNCTION public.prevent_helpful_count_manipulation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.helpful_count IS DISTINCT FROM OLD.helpful_count
     AND current_setting('role') <> 'service_role'
     AND auth.role() <> 'service_role' THEN
    NEW.helpful_count := OLD.helpful_count;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_helpful_count_manipulation ON public.strain_reviews;
CREATE TRIGGER trg_prevent_helpful_count_manipulation
BEFORE UPDATE ON public.strain_reviews
FOR EACH ROW
EXECUTE FUNCTION public.prevent_helpful_count_manipulation();