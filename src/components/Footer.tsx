import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { BookOpen, Camera, Star, Heart, Home, MessageCircle, FileText, ShoppingBag } from "lucide-react";

const features = [
  { icon: Home, title: "Home", href: "/" },
  { icon: MessageCircle, title: "Chat Demo", href: "/#demo" },
  { icon: ShoppingBag, title: "Catalog", href: "/catalog" },
  { icon: FileText, title: "Blog", href: "/blog" },
  { icon: BookOpen, title: "Strain Journal", href: "/journal" },
  { icon: Camera, title: "Strain Scanner", href: "/scanner" },
  { icon: Star, title: "Community Reviews", href: "/reviews" },
  { icon: Heart, title: "T-Break Coach", href: "/t-break" },
];

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 pb-32 md:pb-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <Link 
                to="/privacy-policy" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/schedule-demo" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Schedule Demo
              </Link>
              <Link 
                to="/auth" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In / Sign Up
              </Link>
              <a 
                href="https://tripplefourmarketplace.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Marketplace
              </a>
            </div>
          </div>
        </div>

        {/* SEO-rich text */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground/60 text-center max-w-2xl mx-auto mb-4">
            Cuddles AI is an AI-powered cannabis budtender offering personalized strain recommendations, a strain journal, strain scanner, community reviews, and a tolerance break coach. Available worldwide.
          </p>
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cuddles AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
