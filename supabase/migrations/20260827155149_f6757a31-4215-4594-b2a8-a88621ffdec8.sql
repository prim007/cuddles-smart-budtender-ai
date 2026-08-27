INSERT INTO public.internal_hook_secrets (name, secret)
VALUES ('nightly_agent_jobs', encode(gen_random_bytes(24), 'hex'))
ON CONFLICT (name) DO NOTHING;

SELECT cron.schedule(
  'nightly-agent-jobs',
  '15 2 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://vfcoctqnohlljuxualwl.supabase.co/functions/v1/nightly-agent-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT secret FROM public.internal_hook_secrets WHERE name = 'nightly_agent_jobs')
    ),
    body := '{}'::jsonb
  );
  $cron$
);