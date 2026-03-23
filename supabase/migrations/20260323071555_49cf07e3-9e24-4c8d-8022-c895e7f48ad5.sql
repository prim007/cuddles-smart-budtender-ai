
-- Plants table for the seedling monitor
CREATE TABLE public.plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_name text NOT NULL,
  strain_name text,
  strain_type text DEFAULT 'Hybrid',
  growth_stage text NOT NULL DEFAULT 'seedling',
  planted_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Plant care logs (watering, feeding, light, etc.)
CREATE TABLE public.plant_care_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_type text NOT NULL, -- 'water', 'feed', 'light', 'prune', 'transplant', 'note'
  log_date timestamp with time zone NOT NULL DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Environment readings
CREATE TABLE public.plant_environment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  temperature numeric,
  humidity numeric,
  ph_level numeric,
  light_hours numeric,
  nutrient_ppm numeric,
  logged_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS for plants
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own plants" ON public.plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plants" ON public.plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plants" ON public.plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plants" ON public.plants FOR DELETE USING (auth.uid() = user_id);

-- RLS for care logs
ALTER TABLE public.plant_care_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own care logs" ON public.plant_care_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own care logs" ON public.plant_care_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own care logs" ON public.plant_care_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS for environment logs
ALTER TABLE public.plant_environment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own env logs" ON public.plant_environment_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own env logs" ON public.plant_environment_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own env logs" ON public.plant_environment_logs FOR DELETE USING (auth.uid() = user_id);
