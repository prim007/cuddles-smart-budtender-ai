
-- Create tenants table for dispensary B2B customers
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  pos_system TEXT,
  store_count INTEGER DEFAULT 1,
  plan TEXT NOT NULL DEFAULT 'standard',
  plan_price INTEGER NOT NULL DEFAULT 150000, -- cents
  status TEXT NOT NULL DEFAULT 'trial',
  embed_key UUID NOT NULL DEFAULT gen_random_uuid(),
  branding_color TEXT DEFAULT '#10b981',
  branding_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Users can view their own tenant record
CREATE POLICY "Users can view own tenant" ON public.tenants
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own tenant record
CREATE POLICY "Users can create own tenant" ON public.tenants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tenant record
CREATE POLICY "Users can update own tenant" ON public.tenants
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all tenants
CREATE POLICY "Admins can view all tenants" ON public.tenants
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all tenants
CREATE POLICY "Admins can manage all tenants" ON public.tenants
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
