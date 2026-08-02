UPDATE public.blog_posts SET featured_image = v.img FROM (VALUES
 ('south-africa-cannabis-2025-update','/blog/south-africa-cannabis-update.jpg'),
 ('cannabis-around-the-world-2025','/blog/cannabis-around-the-world.jpg'),
 ('cannabis-seedling-care-tips','/blog/cannabis-seedling-care.jpg'),
 ('terpenes-explained-cannabis-experience','/blog/terpenes-explained.jpg'),
 ('beginners-guide-to-terpenes','/blog/terpenes-explained.jpg'),
 ('cannabis-mental-health-research','/blog/cannabis-mental-health.jpg'),
 ('cannabis-chronic-pain-relief-science','/blog/cannabis-chronic-pain.jpg'),
 ('cbd-vs-thc-understanding-cannabinoids','/blog/cbd-vs-thc.jpg'),
 ('responsible-cannabis-consumption-beginners-guide','/blog/responsible-consumption.jpg'),
 ('responsible-consumption-tips','/blog/responsible-consumption.jpg'),
 ('indica-vs-sativa-vs-hybrid','/blog/indica-sativa-hybrid.jpg')
) AS v(slug, img) WHERE public.blog_posts.slug = v.slug;