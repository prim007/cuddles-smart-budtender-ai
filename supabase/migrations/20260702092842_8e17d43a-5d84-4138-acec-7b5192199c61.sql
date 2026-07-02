
CREATE OR REPLACE FUNCTION public.get_email_queue_metrics()
RETURNS TABLE(queue_name text, queue_length bigint, newest_msg_age_sec integer, oldest_msg_age_sec integer, total_messages bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  RETURN QUERY
  SELECT m.queue_name::text, m.queue_length, m.newest_msg_age_sec, m.oldest_msg_age_sec, m.total_messages
  FROM pgmq.metrics_all() m
  WHERE m.queue_name IN ('auth_emails','transactional_emails','auth_emails_dlq','transactional_emails_dlq');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_queue_metrics() TO authenticated;
