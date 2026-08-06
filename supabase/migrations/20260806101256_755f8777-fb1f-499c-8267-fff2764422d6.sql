-- 1) Tenant signup auditing: log every insert, flag tampering attempts
CREATE OR REPLACE FUNCTION public.force_tenant_signup_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  tampered jsonb := '{}'::jsonb;
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.plan IS DISTINCT FROM 'standard' THEN
    tampered := tampered || jsonb_build_object('plan', NEW.plan);
  END IF;
  IF NEW.plan_price IS DISTINCT FROM 150000 THEN
    tampered := tampered || jsonb_build_object('plan_price', NEW.plan_price);
  END IF;
  IF NEW.status IS DISTINCT FROM 'trial' THEN
    tampered := tampered || jsonb_build_object('status', NEW.status);
  END IF;
  IF auth.uid() IS NOT NULL AND NEW.user_id IS DISTINCT FROM auth.uid() THEN
    tampered := tampered || jsonb_build_object('user_id', NEW.user_id);
  END IF;

  NEW.user_id := COALESCE(auth.uid(), NEW.user_id);
  NEW.plan := 'standard';
  NEW.plan_price := 150000;
  NEW.status := 'trial';
  NEW.embed_key := gen_random_uuid();

  IF tampered <> '{}'::jsonb THEN
    PERFORM public.log_audit_event(
      'tenant.signup.forced_defaults',
      'tenant',
      NEW.id::text,
      jsonb_build_object('rejected_client_values', tampered, 'business_email', NEW.business_email)
    );
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_tenant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.log_audit_event(
    'tenant.signup',
    'tenant',
    NEW.id::text,
    jsonb_build_object(
      'business_name', NEW.business_name,
      'business_email', NEW.business_email,
      'plan', NEW.plan,
      'status', NEW.status,
      'owner_matches_caller', (NEW.user_id = auth.uid())
    )
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_audit_tenant_signup ON public.tenants;
CREATE TRIGGER trg_audit_tenant_signup
AFTER INSERT ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.audit_tenant_signup();

-- 2) Review vote auditing
CREATE OR REPLACE FUNCTION public.audit_review_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.log_audit_event(
    'review_vote.cast',
    'strain_review',
    NEW.review_id::text,
    jsonb_build_object(
      'vote_id', NEW.id,
      'voter_matches_caller', (NEW.user_id = auth.uid())
    )
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_audit_review_vote ON public.review_votes;
CREATE TRIGGER trg_audit_review_vote
AFTER INSERT ON public.review_votes
FOR EACH ROW EXECUTE FUNCTION public.audit_review_vote();