
-- ============================================================
-- Fix: Change all GRANT-type RLS policies from RESTRICTIVE to PERMISSIVE
-- Keep DENY policies as RESTRICTIVE
-- ============================================================

-- ==================== demo_requests ====================
DROP POLICY IF EXISTS "Admin users can update demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Admin users can view demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Deny anonymous read access" ON public.demo_requests;
DROP POLICY IF EXISTS "Deny non-admin read access" ON public.demo_requests;
DROP POLICY IF EXISTS "Rate limited demo submissions" ON public.demo_requests;

CREATE POLICY "Admin users can update demo requests" ON public.demo_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin users can view demo requests" ON public.demo_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous read access" ON public.demo_requests AS RESTRICTIVE FOR SELECT TO anon USING (false);
CREATE POLICY "Rate limited demo submissions" ON public.demo_requests AS RESTRICTIVE FOR INSERT TO public WITH CHECK (check_demo_rate_limit(email));
CREATE POLICY "Allow demo submissions" ON public.demo_requests FOR INSERT TO public WITH CHECK (true);

-- ==================== strain_journal ====================
DROP POLICY IF EXISTS "Users can create own journal entries" ON public.strain_journal;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.strain_journal;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.strain_journal;
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.strain_journal;

CREATE POLICY "Users can create own journal entries" ON public.strain_journal FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON public.strain_journal FOR DELETE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.strain_journal FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own journal entries" ON public.strain_journal FOR SELECT TO public USING (auth.uid() = user_id);

-- ==================== blog_posts ====================
DROP POLICY IF EXISTS "Admins can manage posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.blog_posts;

CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT TO public USING (published = true);

-- ==================== strain_reviews ====================
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.strain_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.strain_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.strain_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.strain_reviews;
DROP POLICY IF EXISTS "Users can view own reviews directly" ON public.strain_reviews;

CREATE POLICY "Admins can view all reviews" ON public.strain_reviews FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can create reviews" ON public.strain_reviews FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.strain_reviews FOR DELETE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.strain_reviews FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own reviews directly" ON public.strain_reviews FOR SELECT TO public USING (auth.uid() = user_id);

-- ==================== email_leads ====================
DROP POLICY IF EXISTS "Admin users can view email leads" ON public.email_leads;
DROP POLICY IF EXISTS "Deny anonymous read access" ON public.email_leads;
DROP POLICY IF EXISTS "Allow email signups with rate limit" ON public.email_leads;

CREATE POLICY "Admin users can view email leads" ON public.email_leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous read access" ON public.email_leads AS RESTRICTIVE FOR SELECT TO anon USING (false);
CREATE POLICY "Allow email signups with rate limit" ON public.email_leads AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (check_email_rate_limit(email));
CREATE POLICY "Allow email signups" ON public.email_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ==================== strain_scans ====================
DROP POLICY IF EXISTS "Users can create own strain scans" ON public.strain_scans;
DROP POLICY IF EXISTS "Users can delete own strain scans" ON public.strain_scans;
DROP POLICY IF EXISTS "Users can view own strain scans" ON public.strain_scans;

CREATE POLICY "Users can create own strain scans" ON public.strain_scans FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own strain scans" ON public.strain_scans FOR DELETE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own strain scans" ON public.strain_scans FOR SELECT TO public USING (auth.uid() = user_id);

-- ==================== chat_conversations ====================
DROP POLICY IF EXISTS "Admin users can view chats" ON public.chat_conversations;
DROP POLICY IF EXISTS "Deny anonymous read access" ON public.chat_conversations;
DROP POLICY IF EXISTS "Rate limited chat insertions" ON public.chat_conversations;

CREATE POLICY "Admin users can view chats" ON public.chat_conversations FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous read access" ON public.chat_conversations AS RESTRICTIVE FOR SELECT TO anon USING (false);
CREATE POLICY "Rate limited chat insertions" ON public.chat_conversations AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (check_chat_rate_limit(session_id));
CREATE POLICY "Allow chat insertions" ON public.chat_conversations FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ==================== review_votes ====================
DROP POLICY IF EXISTS "Users can create own votes" ON public.review_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.review_votes;
DROP POLICY IF EXISTS "Users can view own votes" ON public.review_votes;

CREATE POLICY "Users can create own votes" ON public.review_votes FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.review_votes FOR DELETE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own votes" ON public.review_votes FOR SELECT TO public USING (auth.uid() = user_id);

-- ==================== tenants ====================
DROP POLICY IF EXISTS "Admins can delete all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Deny anonymous read access" ON public.tenants;
DROP POLICY IF EXISTS "Users can create own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can update own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;

CREATE POLICY "Admins can delete all tenants" ON public.tenants FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all tenants" ON public.tenants FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all tenants" ON public.tenants FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous read access" ON public.tenants AS RESTRICTIVE FOR SELECT TO anon USING (false);
CREATE POLICY "Users can create own tenant" ON public.tenants FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenant" ON public.tenants FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own tenant" ON public.tenants FOR SELECT TO public USING (auth.uid() = user_id);

-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Deny anonymous read access" ON public.user_roles;
DROP POLICY IF EXISTS "Deny non-admin role insertions" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous read access" ON public.user_roles AS RESTRICTIVE FOR SELECT TO anon USING (false);
CREATE POLICY "Deny non-admin role insertions" ON public.user_roles AS RESTRICTIVE FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ==================== article_submissions ====================
DROP POLICY IF EXISTS "Admins can manage submissions" ON public.article_submissions;
DROP POLICY IF EXISTS "Deny anonymous read access" ON public.article_submissions;
DROP POLICY IF EXISTS "Rate limited article submissions" ON public.article_submissions;
DROP POLICY IF EXISTS "Anyone can submit articles with pending status" ON public.article_submissions;

CREATE POLICY "Admins can manage submissions" ON public.article_submissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny anonymous read access" ON public.article_submissions AS RESTRICTIVE FOR SELECT TO public USING (false);
CREATE POLICY "Rate limited article submissions" ON public.article_submissions AS RESTRICTIVE FOR INSERT TO public WITH CHECK (check_article_rate_limit(author_email));
CREATE POLICY "Anyone can submit articles with pending status" ON public.article_submissions FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending'::text);

-- ==================== tolerance_breaks ====================
DROP POLICY IF EXISTS "Users can create own tolerance breaks" ON public.tolerance_breaks;
DROP POLICY IF EXISTS "Users can delete own tolerance breaks" ON public.tolerance_breaks;
DROP POLICY IF EXISTS "Users can update own tolerance breaks" ON public.tolerance_breaks;
DROP POLICY IF EXISTS "Users can view own tolerance breaks" ON public.tolerance_breaks;

CREATE POLICY "Users can create own tolerance breaks" ON public.tolerance_breaks FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tolerance breaks" ON public.tolerance_breaks FOR DELETE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can update own tolerance breaks" ON public.tolerance_breaks FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own tolerance breaks" ON public.tolerance_breaks FOR SELECT TO public USING (auth.uid() = user_id);

-- ==================== tenant_strains ====================
DROP POLICY IF EXISTS "Tenants can view own strains" ON public.tenant_strains;
DROP POLICY IF EXISTS "Tenants can insert own strains" ON public.tenant_strains;
DROP POLICY IF EXISTS "Tenants can update own strains" ON public.tenant_strains;
DROP POLICY IF EXISTS "Tenants can delete own strains" ON public.tenant_strains;
DROP POLICY IF EXISTS "Admins can manage all tenant strains" ON public.tenant_strains;
DROP POLICY IF EXISTS "Public read for active tenants" ON public.tenant_strains;

CREATE POLICY "Tenants can view own strains" ON public.tenant_strains FOR SELECT TO public USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));
CREATE POLICY "Tenants can insert own strains" ON public.tenant_strains FOR INSERT TO public WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));
CREATE POLICY "Tenants can update own strains" ON public.tenant_strains FOR UPDATE TO public USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));
CREATE POLICY "Tenants can delete own strains" ON public.tenant_strains FOR DELETE TO public USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all tenant strains" ON public.tenant_strains FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read for active tenants" ON public.tenant_strains FOR SELECT TO public USING (tenant_id IN (SELECT id FROM tenants WHERE status = ANY(ARRAY['trial'::text, 'active'::text])));
