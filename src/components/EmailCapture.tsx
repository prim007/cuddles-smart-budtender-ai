import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Sparkles, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackLeadCaptured } from "@/components/GoogleAnalytics";

interface EmailCaptureProps {
  variant?: "inline" | "modal";
  onClose?: () => void;
}

const EmailCapture = ({ variant = "inline", onClose }: EmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("email_leads").insert({
        email: email.trim().toLowerCase(),
        source: "chat_widget",
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "Check your inbox for your promo code!",
          });
          setIsSubmitted(true);
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        trackLeadCaptured("email_capture_chat", email.trim().toLowerCase());
        toast({
          title: "Welcome to the tribe! ✌️",
          description: "Check your inbox for your 15% discount code!",
        });
      }

      // Send promo code email
      supabase.functions.invoke("send-promo-code", {
        body: { email: email.trim().toLowerCase() },
      }).catch((err) => console.error("Failed to send promo email:", err));
    } catch (error) {
      console.error("Error submitting email:", error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "modal") {
    return (
      <Card className="fixed bottom-24 right-4 z-50 p-4 w-80 bg-card/95 backdrop-blur-sm border-border shadow-elevated animate-fade-in">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {isSubmitted ? (
          <div className="py-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-hippie-green/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-hippie-green" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">You're in! ✌️</h3>
                <p className="text-xs text-muted-foreground">Check your inbox soon</p>
              </div>
            </div>
            <div className="border-t border-border/50 pt-3 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">🌿 Latest Cannabis News</p>
              <ul className="space-y-1.5 text-xs">
                <li className="text-foreground/80 hover:text-foreground transition-colors">
                  <a href="https://www.leafly.com/news" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <span className="text-hippie-green">→</span> New strains hitting dispensaries in 2026
                  </a>
                </li>
                <li className="text-foreground/80 hover:text-foreground transition-colors">
                  <a href="https://www.cannabisbusinesstimes.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <span className="text-hippie-green">→</span> AI transforms cannabis retail experience
                  </a>
                </li>
                <li className="text-foreground/80 hover:text-foreground transition-colors">
                  <a href="https://www.mjbizdaily.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <span className="text-hippie-green">→</span> Medical cannabis research breakthroughs
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-hippie-purple to-hippie-pink flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Stay groovy!</h3>
                <p className="text-xs text-muted-foreground">Get cannabis tips & exclusive updates</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-9 text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !email.trim()}
                className="bg-gradient-to-r from-hippie-purple to-hippie-pink hover:opacity-90"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </Card>
    );
  }

  // Inline variant
  return (
    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-hippie-purple/10 via-hippie-pink/10 to-hippie-orange/10 border border-border/50">
      {isSubmitted ? (
        <div className="space-y-4">
          <div className="text-center">
            <Check className="h-8 w-8 text-hippie-green mx-auto mb-2" />
            <p className="font-medium text-foreground">Thanks for subscribing! ✌️</p>
            <p className="text-sm text-muted-foreground mt-1">Welcome to the Cuddles community</p>
          </div>
          <div className="border-t border-border/50 pt-4">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-hippie-purple" />
              Latest Cannabis News
            </p>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground hover:text-foreground transition-colors">
                <a href="https://www.leafly.com/news" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <span className="text-hippie-green font-bold">→</span> New strains hitting dispensaries in 2026
                </a>
              </li>
              <li className="text-muted-foreground hover:text-foreground transition-colors">
                <a href="https://www.cannabisbusinesstimes.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <span className="text-hippie-green font-bold">→</span> AI transforms cannabis retail experience
                </a>
              </li>
              <li className="text-muted-foreground hover:text-foreground transition-colors">
                <a href="https://www.mjbizdaily.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <span className="text-hippie-green font-bold">→</span> Medical cannabis research breakthroughs
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-hippie-purple" />
            <span className="font-medium text-foreground">Join the Cuddles community</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Get cannabis education, strain guides, and exclusive updates delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="bg-gradient-to-r from-hippie-purple to-hippie-pink hover:opacity-90"
            >
              Subscribe
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default EmailCapture;
