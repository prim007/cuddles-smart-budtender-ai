-- Create blog_posts table for cannabis education content
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL DEFAULT 'Cuddles Team',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts (for SEO)
CREATE POLICY "Anyone can read published posts"
ON public.blog_posts
FOR SELECT
USING (published = true);

-- Only admins can manage posts
CREATE POLICY "Admins can manage posts"
ON public.blog_posts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for slug lookups
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published, published_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial educational content
INSERT INTO public.blog_posts (title, slug, excerpt, content, tags, published, published_at) VALUES
(
  'Understanding Cannabis Strains: Indica vs Sativa vs Hybrid',
  'indica-vs-sativa-vs-hybrid',
  'Learn the key differences between indica, sativa, and hybrid cannabis strains, and how to choose the right one for your needs.',
  E'# Understanding Cannabis Strains: Indica vs Sativa vs Hybrid\n\n*Disclaimer: This content is for educational purposes only and should not be considered medical advice.*\n\nWhen exploring cannabis, one of the first things you''ll encounter is the classification of strains into three main categories: Indica, Sativa, and Hybrid.\n\n## Indica Strains\n\nIndica plants are typically shorter and bushier with broader leaves. They''re known for their relaxing effects.\n\n**Common characteristics:**\n- Relaxing, full-body effects\n- May help with sleep\n- Popular for nighttime use\n\n## Sativa Strains\n\nSativa plants grow taller with narrower leaves. They''re associated with more energizing effects.\n\n**Common characteristics:**\n- Energizing, cerebral effects\n- May enhance creativity and focus\n- Popular for daytime use\n\n## Hybrid Strains\n\nHybrids are crossbreeds offering a balance of effects.\n\n*Always start low and go slow when trying new strains.*',
  ARRAY['education', 'strains', 'beginners'],
  true,
  now() - interval '7 days'
),
(
  'A Beginner''s Guide to Cannabis Terpenes',
  'beginners-guide-to-terpenes',
  'Discover what terpenes are, how they affect your cannabis experience, and why they matter just as much as THC and CBD.',
  E'# A Beginner''s Guide to Cannabis Terpenes\n\n*Disclaimer: This content is for educational purposes only and should not be considered medical advice.*\n\nTerpenes are aromatic compounds found in many plants, including cannabis.\n\n## Common Cannabis Terpenes\n\n### Myrcene\n- Earthy, musky aroma\n- Most common terpene in cannabis\n\n### Limonene\n- Citrus aroma\n- Often associated with uplifting effects\n\n### Pinene\n- Pine, forest aroma\n- May help with alertness\n\n### Linalool\n- Floral, lavender aroma\n- Often associated with calming effects\n\n## The Entourage Effect\n\nTerpenes work together with cannabinoids to create the entourage effect.',
  ARRAY['education', 'terpenes', 'science'],
  true,
  now() - interval '3 days'
),
(
  'Responsible Consumption: Tips for New Cannabis Users',
  'responsible-consumption-tips',
  'Essential tips for new cannabis users on dosing, methods of consumption, and how to have a safe, enjoyable experience.',
  E'# Responsible Consumption Tips\n\n*Disclaimer: This content is for educational purposes only and should not be considered medical advice.*\n\n## Start Low, Go Slow\n\n- Begin with a low dose\n- Wait to feel effects before consuming more\n- Effects can take 5-15 minutes (smoking) or 30-90 minutes (edibles)\n\n## Choose Your Method Wisely\n\n### Inhalation\n- Effects felt within minutes\n- Easier to control dosing\n\n### Edibles\n- Effects can take 30-90 minutes\n- Effects are stronger and longer-lasting\n\n## Know Your Limits\n\n- Don''t mix with alcohol\n- Don''t drive\n- If uncomfortable, remember: it will pass\n\n*When in doubt, wait it out.*',
  ARRAY['education', 'beginners', 'safety'],
  true,
  now() - interval '1 day'
);