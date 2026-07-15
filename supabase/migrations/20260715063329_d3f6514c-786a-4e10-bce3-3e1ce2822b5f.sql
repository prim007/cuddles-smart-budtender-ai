CREATE OR REPLACE FUNCTION public.get_email_queue_metrics()
RETURNS TABLE(
  queue_name text,
  queue_length bigint,
  newest_msg_age_sec double precision,
  oldest_msg_age_sec double precision,
  total_messages bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  q record;
  qtable text;
  sql text;
  rec record;
BEGIN
  FOR q IN
    SELECT c.relname AS tbl,
           regexp_replace(c.relname, '^q_', '') AS qname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'pgmq'
      AND c.relkind = 'r'
      AND c.relname LIKE 'q\_%'
  LOOP
    qtable := format('pgmq.%I', q.tbl);
    sql := format($f$
      SELECT
        %L::text AS queue_name,
        COUNT(*)::bigint AS queue_length,
        EXTRACT(EPOCH FROM (now() - MAX(enqueued_at)))::float8 AS newest_msg_age_sec,
        EXTRACT(EPOCH FROM (now() - MIN(enqueued_at)))::float8 AS oldest_msg_age_sec,
        COUNT(*)::bigint AS total_messages
      FROM %s
    $f$, q.qname, qtable);
    FOR rec IN EXECUTE sql LOOP
      queue_name := rec.queue_name;
      queue_length := rec.queue_length;
      newest_msg_age_sec := rec.newest_msg_age_sec;
      oldest_msg_age_sec := rec.oldest_msg_age_sec;
      total_messages := rec.total_messages;
      RETURN NEXT;
    END LOOP;
  END LOOP;
  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.get_email_queue_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_email_queue_metrics() TO authenticated, service_role;
