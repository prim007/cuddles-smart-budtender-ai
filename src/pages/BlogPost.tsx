import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, ArrowLeft, Tag, Share2, Bot, UserPlus, ArrowRight, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent, trackArticleEngaged } from "@/components/GoogleAnalytics";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  published_at: string;
  featured_image: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const articleEngagedRef = React.useRef(false);

  // Track 50% scroll depth on article
  React.useEffect(() => {
    if (!slug) return;
    const handleScroll = () => {
      if (articleEngagedRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollTop / docHeight >= 0.5) {
        articleEngagedRef.current = true;
        trackArticleEngaged(slug);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });

  const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ThemeToggle />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4" />
            <div className="h-12 bg-muted rounded w-3/4 mb-4" />
            <div className="h-6 bg-muted rounded w-1/2 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <ThemeToggle />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        description={post.excerpt}
        url={`/blog/${post.slug}`}
        type="article"
        author={post.author}
        publishedTime={post.published_at}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          author: {
            "@type": "Organization",
            name: post.author,
          },
          datePublished: post.published_at,
          publisher: {
            "@type": "Organization",
            name: "Cuddles",
            logo: {
              "@type": "ImageObject",
              url: "https://cuddles-smart-budtender-ai.lovable.app/apple-touch-icon.png",
            },
          },
        }}
      />
      <ThemeToggle />

      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-hippie-lavender/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-hippie-coral/15 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_at), "MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readingTime(post.content)} min read
              </span>
              <span>By {post.author}</span>
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
            <ReactMarkdown
              disallowedElements={['script', 'iframe', 'object', 'embed', 'link', 'style']}
              unwrapDisallowed
            >{post.content}</ReactMarkdown>

            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-muted rounded-xl border">
              <p className="text-sm text-muted-foreground italic m-0">
                <strong>Disclaimer:</strong> This content is for educational purposes only and
                should not be considered medical advice. Always consult with a healthcare
                professional before making decisions about cannabis use.
              </p>
            </div>
          </article>

          {/* Contextual AI chat prompts embedded in blog */}
          <div className="max-w-3xl mx-auto mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border">
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Have questions about this topic?
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Ask Cuddles AI anything related to this article — get instant, personalized answers.
              </p>
            </div>

            {/* Contextual quick prompts based on article tags */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {(post.tags || []).slice(0, 3).map((tag) => (
                <Link key={tag} to={`/#demo`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => trackEvent('blog_ai_prompt', 'engagement', `${tag}_${post.slug}`)}
                    className="rounded-full gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Tell me more about {tag}
                  </Button>
                </Link>
              ))}
              <Link to="/#demo">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => trackEvent('blog_ai_prompt', 'engagement', `general_${post.slug}`)}
                  className="rounded-full gap-2"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Get a recommendation
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  onClick={() => trackEvent('cta_click', 'signup', 'blog_post_bottom')}
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
                  onClick={() => trackEvent('cta_click', 'demo', 'blog_post_try_ai')}
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

export default BlogPost;
