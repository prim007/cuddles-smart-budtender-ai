-- Performance indexes for scaling
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_created ON public.chat_conversations(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_strain_journal_user_id ON public.strain_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_strain_journal_session_date ON public.strain_journal(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_strain_reviews_strain_name ON public.strain_reviews(strain_name);
CREATE INDEX IF NOT EXISTS idx_strain_reviews_created_at ON public.strain_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tolerance_breaks_user_id_status ON public.tolerance_breaks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_strain_scans_user_id ON public.strain_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_email_leads_email ON public.email_leads(email);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published, published_at DESC);