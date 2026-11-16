CREATE OR REPLACE FUNCTION public.get_email_queue_metrics()
 RETURNS TABLE(queue_name text, queue_length bigint, newest_msg_age_sec double precision, oldest_msg_age_sec double precision, total_messages bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  q record;
  rec record;
BEGIN
  IF NOT (auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'::public.app_role)) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  FOR q IN
    SELECT c.relname AS tbl, regexp_replace(c.relname, '^q_', '') AS qname
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'pgmq' AND c.relkind = 'r' AND c.relname LIKE 'q\_%'
  LOOP
    FOR rec IN EXECUTE format(
      'SELECT %L::text AS queue_name, COUNT(*)::bigint AS queue_length,
         EXTRACT(EPOCH FROM (now() - MAX(enqueued_at)))::float8 AS newest_msg_age_sec,
         EXTRACT(EPOCH FROM (now() - MIN(enqueued_at)))::float8 AS oldest_msg_age_sec,
         COUNT(*)::bigint AS total_messages
       FROM pgmq.%I', q.qname, q.tbl)
    LOOP
      queue_name := rec.queue_name;
      queue_length := rec.queue_length;
      newest_msg_age_sec := rec.newest_msg_age_sec;
      oldest_msg_age_sec := rec.oldest_msg_age_sec;
      total_messages := rec.total_messages;
      RETURN NEXT;
    END LOOP;
  END LOOP;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_email_queue_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_email_queue_metrics() TO authenticated, service_role;