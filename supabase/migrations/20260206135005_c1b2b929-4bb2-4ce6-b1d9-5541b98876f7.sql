-- Create a secure RPC function to increment helpful count
-- This prevents unauthenticated users from directly updating reviews
-- and ensures atomic increments (no race conditions)

CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE strain_reviews 
  SET helpful_count = COALESCE(helpful_count, 0) + 1 
  WHERE id = p_review_id;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
-- The function itself controls access, not direct table access
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO anon;