import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { BookOpen, Camera, Star, Heart, Home, MessageCircle, FileText, ShoppingBag, Sprout, Download } from "lucide-react";

const features = [
  { icon: Home, title: "Home", href: "/" },
  { icon: MessageCircle, title: "Chat Demo", href: "/#demo" },
  { icon: ShoppingBag, title: "Catalog", href: "/catalog" },
  { icon: FileText, title: "Blog", href: "/blog" },
  { icon: BookOpen, title: "Strain Journal", href: "/journal" },
  { icon: Camera, title: "Strain Scanner", href: "/scanner" },
  { icon: Star, title: "Community Reviews", href: "/reviews" },
  { icon: Heart, title: "T-Break Coach", href: "/t-break" },
  { icon: Sprout, title: "Seedling Monitor", href: "/grow" },
];

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 pb-32 md:pb-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20">
                <img src={cuddlesImage} alt="Cuddles" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-display font-semibold text-foreground">Cuddles</div>
                <div className="text-xs text-muted-foreground">AI-Powered Budtender</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your personal AI cannabis companion for strain recommendations, journaling, and more.
            </p>
          </div>
          
          {/* Features */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature) => (
                <Link
                  key={feature.href}
                  to={feature.href}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <feature.icon className="w-4 h-4" />
                  {feature.title}
                </Link>
              ))}
            </div>
          </div>

          {/* For Dispensaries */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Dispensaries</h4>
            <div className="flex flex-col gap-2">
              <Link to="/ai-budtender" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                AI Budtender
              </Link>
              <Link to="/pos-integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                POS Integrations
              </Link>
              <Link to="/ai-vs-manual-budtending" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                AI vs Manual Budtending
              </Link>
              <Link to="/how-ai-budtender-increases-basket-size" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Increase Basket Size
              </Link>
              <Link to="/cannabis-retail-automation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cannabis Retail Automation
              </Link>
              <Link to="/reduce-dispensary-wait-times" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Reduce Wait Times
              </Link>
              <Link to="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Our Technology (RAG)
              </Link>
              <Link to="/why-cuddles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Why Cuddles AI
              </Link>
              <Link to="/dispensary-onboarding" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/schedule-demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Schedule Demo
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In / Sign Up
              </Link>
              <Link to="/education/chat-with-cuddles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Chat with Cuddles
              </Link>
              <a href="https://tripplefourshophub.online" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Shop — Tripple Four
              </a>
              <Link to="/install" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                <Download className="w-4 h-4" />
                Install Cuddles App
              </Link>
            </div>
          </div>
        </div>

        {/* SEO-rich text with internal links */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground/60 text-center max-w-2xl mx-auto mb-2">
            Cuddles AI is the world's smartest <Link to="/ai-budtender" className="underline hover:text-foreground">AI-powered cannabis budtender</Link> offering personalized <Link to="/#demo" className="underline hover:text-foreground">strain recommendations</Link>, a <Link to="/journal" className="underline hover:text-foreground">strain journal</Link>, <Link to="/scanner" className="underline hover:text-foreground">strain scanner</Link>, <Link to="/reviews" className="underline hover:text-foreground">community reviews</Link>, a <Link to="/t-break" className="underline hover:text-foreground">tolerance break coach</Link>, and a <Link to="/grow" className="underline hover:text-foreground">seedling monitor for growers</Link>. <Link to="/pos-integrations" className="underline hover:text-foreground">Integrates with Dutchie, Flowhub, Cova & Sweed</Link>. Powered by <Link to="/technology" className="underline hover:text-foreground">RAG technology</Link> for <Link to="/cannabis-retail-automation" className="underline hover:text-foreground">cannabis retail automation</Link>. Available worldwide for cannabis enthusiasts and <Link to="/dispensary-onboarding" className="underline hover:text-foreground">dispensaries</Link>.
          </p>
          <p className="text-xs text-muted-foreground/60 text-center max-w-2xl mx-auto mb-4">
            Learn about cannabis with our <Link to="/blog" className="underline hover:text-foreground">educational blog</Link> covering topics from <Link to="/blog/indica-vs-sativa-vs-hybrid" className="underline hover:text-foreground">indica vs sativa</Link> to <Link to="/blog/beginners-guide-to-terpenes" className="underline hover:text-foreground">terpenes</Link> and <Link to="/blog/responsible-consumption-tips" className="underline hover:text-foreground">responsible consumption</Link>.
          </p>
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Cuddles AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
