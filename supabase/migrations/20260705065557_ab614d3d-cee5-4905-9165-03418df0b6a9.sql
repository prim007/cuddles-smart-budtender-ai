
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _target_type text DEFAULT NULL::text,
  _target_id text DEFAULT NULL::text,
  _metadata jsonb DEFAULT '{}'::jsonb,
  _ip_address text DEFAULT NULL::text,
  _user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _id UUID;
  _email TEXT;
  _uid UUID;
  _is_service BOOLEAN;
BEGIN
  _uid := auth.uid();
  _is_service := (auth.role() = 'service_role');

  -- Only admins or the service role may write audit entries.
  IF NOT _is_service AND (_uid IS NULL OR NOT public.has_role(_uid, 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Not authorized to write audit log'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF _uid IS NOT NULL THEN
    SELECT email INTO _email FROM auth.users WHERE id = _uid;
  END IF;

  INSERT INTO public.audit_log (
    actor_user_id, actor_email, action, target_type, target_id, metadata, ip_address, user_agent
  ) VALUES (
    _uid, _email, _action, _target_type, _target_id, COALESCE(_metadata, '{}'::jsonb), _ip_address, _user_agent
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, text, text) TO service_role;
