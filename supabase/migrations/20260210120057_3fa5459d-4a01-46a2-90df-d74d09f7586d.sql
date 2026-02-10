-- Add restrictive policy to deny anonymous/non-admin SELECT on article_submissions
CREATE POLICY "Deny anonymous read access"
ON public.article_submissions
AS RESTRICTIVE
FOR SELECT
USING (false);
