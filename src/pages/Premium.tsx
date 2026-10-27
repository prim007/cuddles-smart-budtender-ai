import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, BookOpen, Zap, Shield } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PREMIUM_TIER } from "@/contexts/SubscriptionContext";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

const CURRENCIES = {
  ZAR: { symbol: "R", rate: 1, label: "ZAR (R)" },
  USD: { symbol: "$", rate: 0.054, label: "USD ($)" },
  EUR: { symbol: "€", rate: 0.050, label: "EUR (€)" },
  GBP: { symbol: "£", rate: 0.043, label: "GBP (£)" },
} as const;

type CurrencyCode = keyof typeof CURRENCIES;

const BASE_PRICE_ZAR = 99;

const Premium = () => {
  const { user } = useAuth();
  const { isPremium, isLoading, subscriptionEnd, startCheckout, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<CurrencyCode>("ZAR");
  const [paypalLoading, setPaypalLoading] = useState<"monthly" | "yearly" | null>(null);

  // PayPal is only for this Premium software subscription.
  const startPaypal = async (plan: "monthly" | "yearly") => {
    setPaypalLoading(plan);
    const { data, error } = await supabase.functions.invoke("paypal-create-subscription", { body: { plan } });
    if (error || !data?.url) {
      let msg = "PayPal checkout couldn't start. Please try again or pay by card.";
      if (error instanceof FunctionsHttpError) {
        try { msg = (await error.context.json()).error ?? msg; } catch { /* keep default */ }
      }
      toast({ title: "PayPal unavailable", description: msg, variant: "destructive" });
      setPaypalLoading(null);
      return;
    }
    window.location.href = data.url;
  };

  const curr = CURRENCIES[currency];
  const convertedPrice = currency === "ZAR" ? BASE_PRICE_ZAR : Math.round(BASE_PRICE_ZAR * curr.rate * 100) / 100;
  const displayPrice = currency === "ZAR" ? `${curr.symbol}${convertedPrice}` : `${curr.symbol}${convertedPrice.toFixed(2)}`;
  const freePrice = `${curr.symbol}0`;

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Welcome to Premium! 🎉", description: "Your subscription is now active." });
      checkSubscription();
    }
    const subId = searchParams.get("subscription_id");
    if (searchParams.get("paypal") === "success" && subId) {
      supabase.functions.invoke("paypal-confirm", { body: { subscriptionId: subId } }).then(({ data }) => {
        if (data?.active) {
          toast({ title: "Welcome to Premium! 🎉", description: "Your PayPal subscription is active." });
        } else {
          toast({ title: "Almost there", description: "PayPal is still confirming your payment. Refresh in a minute." });
        }
        checkSubscription();
      });
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout canceled", description: "No charges were made.", variant: "destructive" });
    }
  }, [searchParams]);

  const features = {
    free: [
      "Unlimited AI budtender chat — always free",
      "Strain search & dispensary finder",
      "3 photo scans a month",
      "5 images or memes a day",
      "Strain journal, T-break timeline & grow logs",
    ],
    premium: [
      "Everything in Free",
      "Unlimited photo scans",
      "20 images or memes a day, no watermark",
      "\"What works for me\" insights from your journal",
      "Daily personal T-break check-ins",
      "Personal feeding & climate schedule for your plants",
    ],
  };

  return (
    <div className="min-h-screen md:pt-20">
      <SEO title="Cuddles Premium - Unlock Your Full Cannabis Experience" description="Upgrade to Cuddles Premium for personalized strain tracking, advanced matching, and exclusive perks." url="/premium" />
      <ThemeToggle />

      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Crown className="w-4 h-4" /> Premium Plans
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Elevate Your Cannabis Experience
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Go beyond basic recommendations. Track, learn, and get matched with the perfect strains based on your personal history.
            </p>
            {/* Currency selector */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setCurrency(code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    currency === code
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {CURRENCIES[code].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-1">Cuddles Basic</h3>
                <p className="text-muted-foreground text-sm">Free forever</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{freePrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {features.free.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/#demo">
                <Button variant="outline" className="w-full">Start Chatting</Button>
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Cuddles Premium
                </h3>
                <p className="text-muted-foreground text-sm">Your personal cannabis companion</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                  {currency !== "ZAR" && (
                    <span className="block text-xs text-muted-foreground mt-1">≈ R{BASE_PRICE_ZAR} ZAR · Billed in ZAR</span>
                  )}
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {features.premium.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <div className="space-y-3">
                  <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm font-semibold text-primary">✓ Active Premium Member</p>
                    {subscriptionEnd && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Renews {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : user ? (
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
                  onClick={() => startCheckout()}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : `Pay by card · R${BASE_PRICE_ZAR}/month`}
                </Button>
              ) : null}
              {!isPremium && user && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-center text-muted-foreground">Or pay with PayPal (billed in US dollars)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => startPaypal("monthly")} disabled={paypalLoading !== null}>
                      {paypalLoading === "monthly" ? "Opening…" : "PayPal $5.49/mo"}
                    </Button>
                    <Button variant="outline" onClick={() => startPaypal("yearly")} disabled={paypalLoading !== null}>
                      {paypalLoading === "yearly" ? "Opening…" : "PayPal $49/yr"}
                    </Button>
                  </div>
                </div>
              )}
              {isPremium || user ? null : (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
                >
                  <Link to="/auth">Sign Up to Unlock Premium</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: "Digital Stash Box", desc: "Save every recommendation and build your personal strain library." },
              { icon: Zap, title: "Smart Matching", desc: "AI learns from your journal to give increasingly accurate suggestions." },
              { icon: Shield, title: "VIP Perks", desc: "Fast-lane ordering, early drops, and member discounts at Tripple444." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Premium;
