-- plants
DROP POLICY "Users can create own plants" ON public.plants;
CREATE POLICY "Users can create own plants" ON public.plants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own plants" ON public.plants;
CREATE POLICY "Users can view own plants" ON public.plants FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can update own plants" ON public.plants;
CREATE POLICY "Users can update own plants" ON public.plants FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can delete own plants" ON public.plants;
CREATE POLICY "Users can delete own plants" ON public.plants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- plant_care_logs
DROP POLICY "Users can create own care logs" ON public.plant_care_logs;
CREATE POLICY "Users can create own care logs" ON public.plant_care_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own care logs" ON public.plant_care_logs;
CREATE POLICY "Users can view own care logs" ON public.plant_care_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can delete own care logs" ON public.plant_care_logs;
CREATE POLICY "Users can delete own care logs" ON public.plant_care_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- plant_environment_logs
DROP POLICY "Users can create own env logs" ON public.plant_environment_logs;
CREATE POLICY "Users can create own env logs" ON public.plant_environment_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own env logs" ON public.plant_environment_logs;
CREATE POLICY "Users can view own env logs" ON public.plant_environment_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can delete own env logs" ON public.plant_environment_logs;
CREATE POLICY "Users can delete own env logs" ON public.plant_environment_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- strain_journal
DROP POLICY "Users can create own journal entries" ON public.strain_journal;
CREATE POLICY "Users can create own journal entries" ON public.strain_journal FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own journal entries" ON public.strain_journal;
CREATE POLICY "Users can view own journal entries" ON public.strain_journal FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can update own journal entries" ON public.strain_journal;
CREATE POLICY "Users can update own journal entries" ON public.strain_journal FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can delete own journal entries" ON public.strain_journal;
CREATE POLICY "Users can delete own journal entries" ON public.strain_journal FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- tolerance_breaks
DROP POLICY "Users can create own tolerance breaks" ON public.tolerance_breaks;
CREATE POLICY "Users can create own tolerance breaks" ON public.tolerance_breaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own tolerance breaks" ON public.tolerance_breaks;
CREATE POLICY "Users can view own tolerance breaks" ON public.tolerance_breaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can update own tolerance breaks" ON public.tolerance_breaks;
CREATE POLICY "Users can update own tolerance breaks" ON public.tolerance_breaks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can delete own tolerance breaks" ON public.tolerance_breaks;
CREATE POLICY "Users can delete own tolerance breaks" ON public.tolerance_breaks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- strain_scans
DROP POLICY "Users can create own strain scans" ON public.strain_scans;
CREATE POLICY "Users can create own strain scans" ON public.strain_scans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own strain scans" ON public.strain_scans;
CREATE POLICY "Users can view own strain scans" ON public.strain_scans FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can delete own strain scans" ON public.strain_scans;
CREATE POLICY "Users can delete own strain scans" ON public.strain_scans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- strain_reviews
DROP POLICY "Authenticated users can create reviews" ON public.strain_reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.strain_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own reviews directly" ON public.strain_reviews;
CREATE POLICY "Users can view own reviews directly" ON public.strain_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can update own reviews" ON public.strain_reviews;
CREATE POLICY "Users can update own reviews" ON public.strain_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can delete own reviews" ON public.strain_reviews;
CREATE POLICY "Users can delete own reviews" ON public.strain_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- review_votes
DROP POLICY "Users can create own votes" ON public.review_votes;
CREATE POLICY "Users can create own votes" ON public.review_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY "Users can view own votes" ON public.review_votes;
CREATE POLICY "Users can view own votes" ON public.review_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY "Users can delete own votes" ON public.review_votes;
CREATE POLICY "Users can delete own votes" ON public.review_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
