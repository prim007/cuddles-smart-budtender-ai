CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_already_voted boolean;
  v_new_count integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to vote';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM review_votes 
    WHERE user_id = v_user_id AND review_id = p_review_id
  ) INTO v_already_voted;

  IF v_already_voted THEN
    RETURN jsonb_build_object('success', false, 'message', 'You have already voted on this review');
  END IF;

  INSERT INTO review_votes (user_id, review_id)
  VALUES (v_user_id, p_review_id);

  UPDATE strain_reviews 
  SET helpful_count = COALESCE(helpful_count, 0) + 1 
  WHERE id = p_review_id
  RETURNING helpful_count INTO v_new_count;

  RETURN jsonb_build_object('success', true, 'helpful_count', v_new_count);
END;
$function$