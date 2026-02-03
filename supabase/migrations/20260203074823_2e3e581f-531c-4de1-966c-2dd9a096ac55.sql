-- Add restrictive policies to deny anonymous access to sensitive tables

-- For chat_conversations: Add restrictive policy requiring authentication for SELECT
CREATE POLICY "Deny anonymous read access"
ON public.chat_conversations
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- For demo_requests: Add restrictive policy requiring authentication for SELECT  
CREATE POLICY "Deny anonymous read access"
ON public.demo_requests
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- For email_leads: Add restrictive policy requiring authentication for SELECT
CREATE POLICY "Deny anonymous read access"
ON public.email_leads
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- For user_roles: Add restrictive policy requiring authentication for SELECT
-- This ensures only authenticated users can query the user_roles table
CREATE POLICY "Deny anonymous read access"
ON public.user_roles
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);