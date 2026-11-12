CREATE OR REPLACE FUNCTION public.are_connected(_a uuid, _b uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IS NOT NULL
    AND auth.uid() IN (_a, _b)
    AND EXISTS (SELECT 1 FROM public.connections WHERE status='accepted'
      AND ((requester_id=_a AND addressee_id=_b) OR (requester_id=_b AND addressee_id=_a)))
$function$;
REVOKE EXECUTE ON FUNCTION public.are_connected(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.are_connected(uuid, uuid) TO authenticated, service_role;