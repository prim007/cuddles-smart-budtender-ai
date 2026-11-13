import { useEffect } from "react";
import { Link } from "react-router-dom";
import cuddlesImage from "@/assets/cuddles.png";
import { BookOpen, Camera, Heart, Home, MessageCircle, FileText, ShoppingBag, Sprout, Download, MapPin } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";
import FooterDispensaryPicker from "./FooterDispensaryPicker";

const WIDGET_SRC = "https://daggaspot.co.za/assets/widget/widget.js";

const features = [
  { icon: Home, title: "Home", href: "/" },
  { icon: MessageCircle, title: "Chat Demo", href: "/#demo" },
  { icon: ShoppingBag, title: "Catalog", href: "/catalog" },
  { icon: FileText, title: "Blog", href: "/blog" },
  { icon: BookOpen, title: "Strain Journal", href: "/journal" },
  { icon: Camera, title: "Strain Scanner", href: "/scanner" },
  
  { icon: Heart, title: "T-Break Coach", href: "/t-break" },
  { icon: Sprout, title: "Seedling Monitor", href: "/grow" },
];

const Footer = () => {
  useEffect(() => {
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.setAttribute("data-api", "https://api.daggaspot.co.za");
    document.body.appendChild(script);
  }, []);

  return (
    <footer className="bg-card border-t border-border py-12 pb-32 md:pb-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20">
                <img src={cuddlesImage} alt="Cuddles AI plant and cannabis companion brand mark" className="w-full h-full object-cover" width={40} height={40} loading="lazy" decoding="async" />
              </div>
              <div>
                <div className="font-display font-semibold text-foreground">Cuddles</div>
                <div className="text-xs text-muted-foreground">AI Plant Expert & Budtender</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mb-2">
              Your personal AI plant companion — plant care, grow help, strain recommendations, journaling and more.

            </p>
<div className="mt-2 bg-card border border-border rounded-xl p-4 shadow-sm">
              <h5 className="font-semibold text-foreground mb-2 text-sm">Join our Newsletter</h5>
              <NewsletterSignup />
            </div>
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
              <Link to="/see-it-in-action" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                See It In Action
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
              <Link to="/what-is-cuddles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                What is Cuddles?
              </Link>
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link to="/popia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                POPIA &amp; Data Rights
              </Link>
              <Link to="/trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Trust &amp; Security
              </Link>
              <Link to="/licensing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Licensing
              </Link>
              <Link to="/copyright" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Copyright &amp; Takedown
              </Link>
              <Link to="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Partners
              </Link>
              <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Install Docs
              </Link>
              <Link to="/reports/plant-questions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Monthly Question Report
              </Link>
              <Link to="/share-your-story" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Get Your Shop's Story Written
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

        <FooterDispensaryPicker />

        {/* SEO-rich text with internal links */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mb-2">
            Cuddles AI is a plant expert first and an <Link to="/ai-budtender" className="underline hover:text-foreground">AI-powered cannabis budtender</Link> second — helping with houseplants, herbs, vegetables and indigenous species alongside personalized <Link to="/#demo" className="underline hover:text-foreground">strain recommendations</Link>, a <Link to="/journal" className="underline hover:text-foreground">strain journal</Link>, <Link to="/scanner" className="underline hover:text-foreground">strain scanner</Link>, a <Link to="/t-break" className="underline hover:text-foreground">tolerance break coach</Link>, and a <Link to="/grow" className="underline hover:text-foreground">seedling monitor for growers</Link>. <Link to="/pos-integrations" className="underline hover:text-foreground">Integrates with Dutchie, Flowhub, Cova & Sweed</Link>. Powered by <Link to="/technology" className="underline hover:text-foreground">RAG technology</Link> for <Link to="/cannabis-retail-automation" className="underline hover:text-foreground">cannabis retail automation</Link>. Available worldwide for plant lovers, cannabis enthusiasts and <Link to="/dispensary-onboarding" className="underline hover:text-foreground">dispensaries</Link>.
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mb-4">
            Learn about cannabis with our <Link to="/blog" className="underline hover:text-foreground">educational blog</Link> covering topics from <Link to="/blog/indica-vs-sativa-vs-hybrid" className="underline hover:text-foreground">indica vs sativa</Link> to <Link to="/blog/beginners-guide-to-terpenes" className="underline hover:text-foreground">terpenes</Link> and <Link to="/blog/responsible-consumption-tips" className="underline hover:text-foreground">responsible consumption</Link>.
          </p>
<div className="flex justify-center py-3">
            {/* @ts-expect-error custom element provided by the DaggaSpot widget */}
            <cannamap-badge
              data-org-id="507bec94-ff41-4f59-aaf5-c0d429249a38"
              data-size="medium"
              data-theme="light"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            © 2026 Cuddles AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
