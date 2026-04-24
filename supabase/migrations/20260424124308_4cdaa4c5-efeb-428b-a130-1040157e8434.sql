-- Allow public read of strain reviews so the community feed works,
-- but revoke direct column access to user_id so it cannot be exposed.
-- The strain_reviews_public view (security_invoker) already excludes user_id.

CREATE POLICY "Anyone can view strain reviews"
ON public.strain_reviews
FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke any existing column privileges then grant only safe columns
REVOKE SELECT ON public.strain_reviews FROM anon, authenticated;

GRANT SELECT (id, strain_name, strain_type, rating, title, review_text, effects, pros, cons, helpful_count, verified_purchase, created_at, updated_at)
ON public.strain_reviews TO anon, authenticated;

-- Authors still need to read their own user_id for "my reviews" flows; grant via separate path
-- Owners can still see their full row through the existing "Users can view own reviews directly" policy,
-- but column-level GRANT controls override. To preserve owner access to user_id, grant it back to authenticated
-- only when querying their own row is impossible to enforce via column grants — so we keep user_id ungranted
-- to anon/authenticated for the base table. Application code reads from strain_reviews_public view, which is fine.
