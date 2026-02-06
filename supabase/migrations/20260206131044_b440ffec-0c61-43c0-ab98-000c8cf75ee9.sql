-- Create strain_journal table for logging cannabis experiences
CREATE TABLE public.strain_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strain_name TEXT NOT NULL,
  strain_type TEXT CHECK (strain_type IN ('indica', 'sativa', 'hybrid', 'unknown')),
  consumption_method TEXT CHECK (consumption_method IN ('smoke', 'vape', 'edible', 'tincture', 'topical', 'other')),
  dosage TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  effects JSONB DEFAULT '[]'::jsonb,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strain_reviews for community reviews
CREATE TABLE public.strain_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strain_name TEXT NOT NULL,
  strain_type TEXT CHECK (strain_type IN ('indica', 'sativa', 'hybrid', 'unknown')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  effects JSONB DEFAULT '[]'::jsonb,
  pros TEXT[],
  cons TEXT[],
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tolerance_breaks for T-break tracking
CREATE TABLE public.tolerance_breaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  target_days INTEGER NOT NULL CHECK (target_days >= 1 AND target_days <= 365),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  reason TEXT,
  daily_logs JSONB DEFAULT '[]'::jsonb,
  motivation_notes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strain_scans for AR strain identification history
CREATE TABLE public.strain_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  identified_strain TEXT,
  confidence_score DECIMAL(5,2),
  strain_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.strain_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strain_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tolerance_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strain_scans ENABLE ROW LEVEL SECURITY;

-- Strain Journal policies - users can only access their own entries
CREATE POLICY "Users can view own journal entries"
  ON public.strain_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
  ON public.strain_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.strain_journal FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.strain_journal FOR DELETE
  USING (auth.uid() = user_id);

-- Strain Reviews policies - public read, own write
CREATE POLICY "Anyone can view reviews"
  ON public.strain_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.strain_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.strain_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.strain_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Tolerance Breaks policies - users can only access their own
CREATE POLICY "Users can view own tolerance breaks"
  ON public.tolerance_breaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tolerance breaks"
  ON public.tolerance_breaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tolerance breaks"
  ON public.tolerance_breaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tolerance breaks"
  ON public.tolerance_breaks FOR DELETE
  USING (auth.uid() = user_id);

-- Strain Scans policies - users can only access their own
CREATE POLICY "Users can view own strain scans"
  ON public.strain_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own strain scans"
  ON public.strain_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own strain scans"
  ON public.strain_scans FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_strain_journal_updated_at
  BEFORE UPDATE ON public.strain_journal
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strain_reviews_updated_at
  BEFORE UPDATE ON public.strain_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tolerance_breaks_updated_at
  BEFORE UPDATE ON public.tolerance_breaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();