import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Tag, ArrowRight, Bot, UserPlus } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import SubmitArticleDialog from "@/components/SubmitArticleDialog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  tags: string[];
  published_at: string;
  featured_image: string | null;
}

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, author, tags, published_at, featured_image")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cannabis Retail Insights | AI Budtender Tips for Dispensary Owners"
        description="Expert insights on cannabis retail automation, AI-powered budtending, terpene science, and dispensary growth strategies. Written for dispensary owners and cannabis professionals."
        url="/blog"
        keywords="cannabis retail blog, dispensary tips, AI budtender insights, cannabis automation, terpene guide, dispensary growth, cannabis industry trends, smart budtender"
      />
      <ThemeToggle />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-hippie-lavender/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-hippie-coral/15 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-hippie-sage/50 text-hippie-sage">
              Cannabis Education
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Cuddles Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Educational content about cannabis strains, terpenes, and responsible consumption.
              <span className="block mt-2 text-sm italic">
                For educational purposes only. Not medical advice.
              </span>
            </p>
            <SubmitArticleDialog />
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    {post.featured_image ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-hippie-sage/30 to-hippie-teal/30 flex items-center justify-center">
                        <span className="text-4xl">🌿</span>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.published_at), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {readingTime(post.excerpt)} min read
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              Ready to find your perfect strain?
            </h3>
            <p className="text-muted-foreground mb-6">
              Cuddles AI gives personalized recommendations based on your preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  onClick={() => trackEvent('cta_click', 'signup', 'blog_listing_bottom')}
                  className="font-display font-semibold rounded-xl gap-2 w-full"
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/#demo">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => trackEvent('cta_click', 'demo', 'blog_listing_try_ai')}
                  className="font-display font-medium rounded-xl gap-2 w-full"
                >
                  <Bot className="w-5 h-5" />
                  Try Cuddles AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
