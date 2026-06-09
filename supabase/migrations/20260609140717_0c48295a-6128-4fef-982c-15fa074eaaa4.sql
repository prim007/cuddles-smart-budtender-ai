
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    SELECT count(*) FROM newsletter_subscribers
    WHERE email = p_email
    AND created_at > (now() - interval '1 hour')
  ) < 3
$$;

CREATE OR REPLACE FUNCTION public.enforce_newsletter_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.check_newsletter_rate_limit(NEW.email) THEN
    RAISE EXCEPTION 'Too many newsletter signup attempts for this email. Please try again later.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS newsletter_subscribers_rate_limit ON public.newsletter_subscribers;
CREATE TRIGGER newsletter_subscribers_rate_limit
BEFORE INSERT ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.enforce_newsletter_rate_limit();
