-- Create email_leads table for newsletter signups
CREATE TABLE public.email_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'chat_widget',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscribed BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit their email
CREATE POLICY "Anyone can submit email leads"
ON public.email_leads
FOR INSERT
WITH CHECK (true);

-- Authenticated users can view leads
CREATE POLICY "Authenticated users can view email leads"
ON public.email_leads
FOR SELECT
USING (auth.uid() IS NOT NULL);