-- Cached AI-generated strain profiles
CREATE TABLE public.strain_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strain_slug text NOT NULL UNIQUE,
  strain_name text NOT NULL,
  strain_type text,
  short_description text,
  long_description text,
  effects jsonb DEFAULT '[]'::jsonb,
  medical_uses jsonb DEFAULT '[]'::jsonb,
  negatives jsonb DEFAULT '[]'::jsonb,
  flavors jsonb DEFAULT '[]'::jsonb,
  terpenes jsonb DEFAULT '[]'::jsonb,
  thc_range text,
  cbd_range text,
  lineage text,
  growing_difficulty text,
  best_time_of_day text,
  similar_strains jsonb DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_strain_profiles_slug ON public.strain_profiles(strain_slug);

ALTER TABLE public.strain_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read strain profiles"
  ON public.strain_profiles FOR SELECT
  USING (true);

CREATE POLICY "Service role manages strain profiles"
  ON public.strain_profiles FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_strain_profiles_updated_at
  BEFORE UPDATE ON public.strain_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Weekly rotation of 10 featured strains
CREATE TABLE public.weekly_featured_strains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  strain_slugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_weekly_featured_week ON public.weekly_featured_strains(week_start DESC);

ALTER TABLE public.weekly_featured_strains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read weekly featured strains"
  ON public.weekly_featured_strains FOR SELECT
  USING (true);

CREATE POLICY "Service role manages weekly featured"
  ON public.weekly_featured_strains FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);