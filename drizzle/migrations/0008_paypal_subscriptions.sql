CREATE TABLE public.paypal_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  paypal_subscription_id text NOT NULL UNIQUE,
  plan_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  next_billing_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX paypal_subscriptions_user_idx ON public.paypal_subscriptions(user_id);
GRANT SELECT ON public.paypal_subscriptions TO authenticated;
GRANT ALL ON public.paypal_subscriptions TO service_role;
ALTER TABLE public.paypal_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own PayPal subscriptions" ON public.paypal_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.paypal_plans (
  key text PRIMARY KEY,
  env text NOT NULL,
  paypal_plan_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.paypal_plans TO service_role;
REVOKE ALL ON public.paypal_plans FROM anon, authenticated;
ALTER TABLE public.paypal_plans ENABLE ROW LEVEL SECURITY;