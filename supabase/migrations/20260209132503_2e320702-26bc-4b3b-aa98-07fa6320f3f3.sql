
-- 1. Remove permissive public SELECT policy exposing user_id on strain_reviews
DROP POLICY IF EXISTS "Anyone can view reviews publicly" ON public.strain_reviews;

-- 2. Add validation triggers for strain_reviews (using triggers instead of CHECK for flexibility)
CREATE OR REPLACE FUNCTION public.validate_strain_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF length(NEW.strain_name) > 100 THEN
    RAISE EXCEPTION 'Strain name must be 100 characters or less';
  END IF;
  IF length(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Title must be 200 characters or less';
  END IF;
  IF length(NEW.review_text) > 2000 THEN
    RAISE EXCEPTION 'Review text must be 2000 characters or less';
  END IF;
  IF NEW.effects IS NOT NULL AND jsonb_array_length(NEW.effects) > 12 THEN
    RAISE EXCEPTION 'Maximum 12 effects allowed';
  END IF;
  IF NEW.pros IS NOT NULL AND array_length(NEW.pros, 1) > 10 THEN
    RAISE EXCEPTION 'Maximum 10 pros allowed';
  END IF;
  IF NEW.cons IS NOT NULL AND array_length(NEW.cons, 1) > 10 THEN
    RAISE EXCEPTION 'Maximum 10 cons allowed';
  END IF;
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_strain_review_trigger
BEFORE INSERT OR UPDATE ON public.strain_reviews
FOR EACH ROW
EXECUTE FUNCTION public.validate_strain_review();

-- 3. Add rate limiting for article submissions
CREATE OR REPLACE FUNCTION public.check_article_rate_limit(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    SELECT count(*) FROM article_submissions
    WHERE author_email = p_email
    AND created_at > (now() - interval '1 day')
  ) < 3
$$;

CREATE POLICY "Rate limited article submissions"
ON public.article_submissions AS RESTRICTIVE
FOR INSERT
WITH CHECK (check_article_rate_limit(author_email));
