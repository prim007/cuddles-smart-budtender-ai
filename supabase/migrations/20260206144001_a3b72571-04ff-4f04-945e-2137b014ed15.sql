-- Fix: Vote manipulation vulnerability in increment_review_helpful function
-- Creates vote tracking table and secure function that requires authentication

-- 1. Create review_votes table to track who voted on what
CREATE TABLE public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES public.strain_reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_id)
);

-- 2. Enable RLS on review_votes
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for review_votes
-- Users can view their own votes
CREATE POLICY "Users can view own votes"
ON public.review_votes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own votes (prevents voting on behalf of others)
CREATE POLICY "Users can create own votes"
ON public.review_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes (to undo a vote)
CREATE POLICY "Users can delete own votes"
ON public.review_votes
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Drop the old vulnerable function
DROP FUNCTION IF EXISTS public.increment_review_helpful(uuid);

-- 5. Create new secure function with authentication and duplicate prevention
CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_already_voted boolean;
  v_new_count integer;
BEGIN
  -- Check authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to vote';
  END IF;

  -- Check if user already voted on this review
  SELECT EXISTS (
    SELECT 1 FROM review_votes 
    WHERE user_id = v_user_id AND review_id = p_review_id
  ) INTO v_already_voted;

  IF v_already_voted THEN
    RETURN jsonb_build_object('success', false, 'message', 'You have already voted on this review');
  END IF;

  -- Record the vote
  INSERT INTO review_votes (user_id, review_id)
  VALUES (v_user_id, p_review_id);

  -- Increment the helpful count
  UPDATE strain_reviews 
  SET helpful_count = COALESCE(helpful_count, 0) + 1 
  WHERE id = p_review_id
  RETURNING helpful_count INTO v_new_count;

  RETURN jsonb_build_object('success', true, 'helpful_count', v_new_count);
END;
$$;

-- 6. Grant execute only to authenticated users (no anon access)
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_review_helpful(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_review_helpful(uuid) FROM public;