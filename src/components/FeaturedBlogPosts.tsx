import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { trackEvent } from "@/components/GoogleAnalytics";
import { mergeStaticBlogPosts } from "@/data/staticBlogPosts";

const FeaturedBlogPosts = () => {
  const { data: posts } = useQuery({
    queryKey: ["featured-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, tags, published_at, featured_image")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const visiblePosts = mergeStaticBlogPosts(posts).slice(0, 3);

  if (visiblePosts.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
            <BookOpen className="w-3 h-3 mr-1" />
            Cannabis Education
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Learn From Our Blog
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Expert articles on strains, terpenes, responsible consumption, and the latest in cannabis legislation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {visiblePosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              onClick={() => trackEvent("blog_card_click", "engagement", post.slug)}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                {post.featured_image ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={160}
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-3xl">🌿</span>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {post.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.published_at && format(new Date(post.published_at), "MMM d, yyyy")}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/blog">
            <Button
              variant="outline"
              size="lg"
              onClick={() => trackEvent("blog_view_all", "engagement", "homepage")}
              className="font-display font-medium rounded-xl gap-2"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBlogPosts;
