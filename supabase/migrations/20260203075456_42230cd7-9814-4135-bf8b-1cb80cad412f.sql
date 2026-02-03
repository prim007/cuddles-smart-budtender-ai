-- Drop the overly permissive email leads INSERT policy and replace with rate-limited one
DROP POLICY IF EXISTS "Anyone can submit email leads" ON public.email_leads;

-- Create rate-limited INSERT policy for email_leads (max 3 submissions per hour per email)
CREATE POLICY "Rate limited email submissions"
ON public.email_leads
FOR INSERT
TO public
WITH CHECK (
  (SELECT count(*) FROM public.email_leads existing 
   WHERE existing.email = email 
   AND existing.created_at > (now() - interval '1 hour')
  ) < 3
);