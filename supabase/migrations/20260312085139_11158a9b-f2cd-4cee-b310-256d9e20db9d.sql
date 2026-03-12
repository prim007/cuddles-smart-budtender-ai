
-- Fix blog_posts RLS: make public read PERMISSIVE so it works independently
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage posts" ON public.blog_posts;

-- Public read: PERMISSIVE (default)
CREATE POLICY "Anyone can read published posts" ON public.blog_posts
FOR SELECT TO public USING (published = true);

-- Admin manage: PERMISSIVE (default)
CREATE POLICY "Admins can manage posts" ON public.blog_posts
FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));
