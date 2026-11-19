CREATE OR REPLACE FUNCTION public.get_email_queue_metrics()
RETURNS TABLE(queue_name text, queue_length bigint, newest_msg_age_sec double precision, oldest_msg_age_sec double precision, total_messages bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT COALESCE(auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'::public.app_role), false) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  IF pg_catalog.to_regclass('pgmq.q_auth_emails') IS NOT NULL THEN
    RETURN QUERY SELECT 'auth_emails'::text, COUNT(*)::bigint,
      EXTRACT(EPOCH FROM (now() - MAX(enqueued_at)))::double precision,
      EXTRACT(EPOCH FROM (now() - MIN(enqueued_at)))::double precision,
      COUNT(*)::bigint FROM pgmq.q_auth_emails;
  END IF;
  IF pg_catalog.to_regclass('pgmq.q_transactional_emails') IS NOT NULL THEN
    RETURN QUERY SELECT 'transactional_emails'::text, COUNT(*)::bigint,
      EXTRACT(EPOCH FROM (now() - MAX(enqueued_at)))::double precision,
      EXTRACT(EPOCH FROM (now() - MIN(enqueued_at)))::double precision,
      COUNT(*)::bigint FROM pgmq.q_transactional_emails;
  END IF;
  IF pg_catalog.to_regclass('pgmq.q_auth_emails_dlq') IS NOT NULL THEN
    RETURN QUERY SELECT 'auth_emails_dlq'::text, COUNT(*)::bigint,
      EXTRACT(EPOCH FROM (now() - MAX(enqueued_at)))::double precision,
      EXTRACT(EPOCH FROM (now() - MIN(enqueued_at)))::double precision,
      COUNT(*)::bigint FROM pgmq.q_auth_emails_dlq;
  END IF;
  IF pg_catalog.to_regclass('pgmq.q_transactional_emails_dlq') IS NOT NULL THEN
    RETURN QUERY SELECT 'transactional_emails_dlq'::text, COUNT(*)::bigint,
      EXTRACT(EPOCH FROM (now() - MAX(enqueued_at)))::double precision,
      EXTRACT(EPOCH FROM (now() - MIN(enqueued_at)))::double precision,
      COUNT(*)::bigint FROM pgmq.q_transactional_emails_dlq;
  END IF;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.get_email_queue_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_email_queue_metrics() TO authenticated, service_role;