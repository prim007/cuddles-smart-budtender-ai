import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Zap,
  Shield,
  BarChart3,
  Headphones,
  Store,
  Sparkles,
  Lock,
  CreditCard,
} from "lucide-react";
import cuddlesImage from "@/assets/cuddles.png";
import SEO from "@/components/SEO";

const POS_OPTIONS = [
  "Dutchie",
  "Flowhub",
  "Treez",
  "Meadow",
  "Cova",
  "Blaze",
  "Other",
];

const PLAN_FEATURES = [
  { icon: <Zap className="w-5 h-5" />, text: "AI-powered budtender chat widget", benefit: "Serve customers 24/7 without extra staff" },
  { icon: <Store className="w-5 h-5" />, text: "POS inventory sync", benefit: "Real-time menu updates from Dutchie, Flowhub & more" },
  { icon: <BarChart3 className="w-5 h-5" />, text: "Customer analytics dashboard", benefit: "Understand what your customers really want" },
  { icon: <Shield className="w-5 h-5" />, text: "Custom branding & white-label", benefit: "Looks like your brand, not ours" },
  { icon: <Headphones className="w-5 h-5" />, text: "Priority support & onboarding", benefit: "We set it up for you in under 24 hours" },
  { icon: <Sparkles className="w-5 h-5" />, text: "Strain recommendations engine", benefit: "Boost average order value with smart upsells" },
];

// High-level overview of what's bundled in the paid plan (display only).
const PREMIUM_INCLUDES = [
  "Unlimited AI chat conversations on your website",
  "Live POS / inventory sync with your menu",
  "Customer analytics & conversion dashboard",
  "Custom branding, colors & white-label widget",
  "Priority email + chat support and dedicated onboarding",
  "Smart strain recommendations & upsell engine",
  "Multi-location support",
  "Secure tenant-scoped embed key (issued after subscription)",
];

const FORM_STORAGE_KEY = "dispensary_onboarding_form_v1";

const DispensaryOnboarding = () => {
  const { user } = useAuth();
  const { isPremium, isLoading: subLoading, startCheckout } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [embedKey, setEmbedKey] = useState<string | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [posSystem, setPosSystem] = useState("");
  const [storeCount, setStoreCount] = useState(1);
  const [brandingColor, setBrandingColor] = useState("#10b981");

  // Steps: 0 Welcome, 1 Business Info, 2 Plan Overview, 3 Subscribe, 4 Embed Code
  const totalSteps = 5;

  // Restore form from localStorage (in case user came back from PayFast)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      if (raw) {
        const f = JSON.parse(raw);
        if (f.businessName) setBusinessName(f.businessName);
        if (f.businessEmail) setBusinessEmail(f.businessEmail);
        if (f.phone) setPhone(f.phone);
        if (f.website) setWebsite(f.website);
        if (f.posSystem) setPosSystem(f.posSystem);
        if (f.storeCount) setStoreCount(f.storeCount);
        if (f.brandingColor) setBrandingColor(f.brandingColor);
      }
    } catch {}
  }, []);

  // If user lands back with ?subscribed=true or is already premium, jump to subscribe-confirmation step
  useEffect(() => {
    if (searchParams.get("subscribed") === "true" || (isPremium && !subLoading)) {
      setStep((s) => (s < 3 ? 3 : s));
    }
  }, [searchParams, isPremium, subLoading]);

  const persistForm = () => {
    localStorage.setItem(
      FORM_STORAGE_KEY,
      JSON.stringify({ businessName, businessEmail, phone, website, posSystem, storeCount, brandingColor })
    );
  };

  // Provision tenant + fetch embed key (ONLY after subscription is active)
  const provisionTenant = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth?redirect=/dispensary-onboarding");
      return;
    }
    if (!isPremium) {
      toast.error("Active subscription required to generate your embed key.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Reuse existing tenant if any
      const { data: existing } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("tenants").insert({
          user_id: user.id,
          business_name: businessName,
          business_email: businessEmail,
          phone: phone || null,
          website: website || null,
          pos_system: posSystem || null,
          store_count: storeCount,
          branding_color: brandingColor,
        });
        if (error) throw error;
      }

      const { data: embedKeyData, error: embedError } = await supabase.rpc("get_my_embed_key");
      if (embedError) throw embedError;

      setEmbedKey(embedKeyData);
      setStep(4);
      localStorage.removeItem(FORM_STORAGE_KEY);
      toast.success("Welcome aboard! Your embed key is ready.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      persistForm();
      toast.info("Please sign in to subscribe");
      navigate("/auth?redirect=/dispensary-onboarding");
      return;
    }
    persistForm();
    await startCheckout({ plan: "pro", returnPath: "/dispensary-onboarding" });
  };

  const copyEmbedCode = () => {
    const code = `<script src="https://cuddles-smart-budtender-ai.lovable.app/widget.js" data-key="${embedKey}" data-color="${brandingColor}"></script>`;
    navigator.clipboard.writeText(code);
    toast.success("Embed code copied to clipboard!");
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return businessName.trim() && businessEmail.trim();
      case 2: return true;
      case 3: return isPremium;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step === 0 && !user) {
      toast.info("Please sign in to continue setup");
      navigate("/auth?redirect=/dispensary-onboarding");
      return;
    }
    if (step === 3) {
      provisionTenant();
    } else if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/60" : "w-2 bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SEO
        title="Dispensary Onboarding — Add Cuddles AI to Your Store"
        description="Onboard your dispensary onto Cuddles AI: connect your menu, get an embeddable AI budtender widget, and start a 14-day free trial."
        url="/dispensary-onboarding"
      />
      <Card className="w-full max-w-2xl border-border/50 shadow-elevated bg-card/95 backdrop-blur-sm">
        <CardContent className="p-8">
          <ProgressDots />

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-hippie-lavender to-hippie-teal shadow-glow">
                <img src={cuddlesImage} alt="Cuddles" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Power Your Dispensary with AI 🌿</h1>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Add Cuddles AI to your dispensary website in minutes. Give your customers a personalized budtender experience 24/7.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto text-left">
                {PLAN_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-primary mt-0.5 shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.text}</p>
                      <p className="text-xs text-muted-foreground">{f.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Tell Us About Your Dispensary</h2>
                <p className="text-muted-foreground">We'll use this to set up your Cuddles instance.</p>
              </div>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Business Name *
                  </Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Green Valley Dispensary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> Business Email *
                  </Label>
                  <Input id="businessEmail" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="contact@greenvalley.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> Phone
                  </Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" /> Website
                  </Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://greenvalley.com" />
                </div>
                <div className="space-y-2">
                  <Label>POS System</Label>
                  <div className="flex flex-wrap gap-2">
                    {POS_OPTIONS.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosSystem(pos)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          posSystem === pos
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeCount">Number of Locations</Label>
                  <Input id="storeCount" type="number" min={1} value={storeCount} onChange={(e) => setStoreCount(Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Plan Overview (what's included) */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">What's Included</h2>
                <p className="text-muted-foreground">A quick overview of everything in your Cuddles Pro plan.</p>
              </div>
              <div className="max-w-md mx-auto">
                <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card to-muted/30 p-6 space-y-5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Cuddles Pro</p>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">$1,500</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">14-day free trial • Cancel anytime</p>
                  </div>
                  <div className="border-t border-border pt-4 space-y-2.5">
                    {PREMIUM_INCLUDES.map((line) => (
                      <div key={line} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Brand Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandingColor}
                        onChange={(e) => setBrandingColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">Widget accent color</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  You'll receive your secure embed key after activating your subscription.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Subscribe (gates the embed key) */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  {isPremium ? <Check className="w-8 h-8 text-accent" /> : <Lock className="w-8 h-8 text-primary" />}
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {isPremium ? "Subscription Active" : "Activate Your Subscription"}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isPremium
                    ? "You're all set. Continue to generate your secure embed key."
                    : "Your unique embed key is generated only after your subscription is active — this keeps it from being shared or stolen."}
                </p>
              </div>

              {!isPremium && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Cuddles Pro — $1,500/mo</p>
                    <p>14-day free trial • Cancel anytime • Secure checkout via PayFast</p>
                  </div>
                  <Button
                    onClick={handleSubscribe}
                    disabled={subLoading}
                    className="w-full bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white rounded-xl h-12"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {subLoading ? "Redirecting…" : "Subscribe Now"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    You'll be returned here automatically after payment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Embed Code (only reachable after subscription) */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">You're All Set! 🎉</h2>
                <p className="text-muted-foreground">Add this snippet to your website to activate Cuddles.</p>
              </div>
              <div className="max-w-lg mx-auto">
                <div className="relative rounded-xl bg-foreground/5 border border-border p-4">
                  <pre className="text-xs text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all font-mono">
{`<script
  src="https://cuddles-smart-budtender-ai.lovable.app/widget.js"
  data-key="${embedKey}"
  data-color="${brandingColor}"
></script>`}
                  </pre>
                  <Button size="sm" variant="ghost" onClick={copyEmbedCode} className="absolute top-2 right-2">
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Paste this before the closing <code>&lt;/body&gt;</code> tag on your website. Keep your key private.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0 || step === 4}
              className={step === 0 || step === 4 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step === 4 ? (
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white rounded-xl"
              >
                Go to Dashboard
              </Button>
            ) : step === 3 ? (
              <Button
                onClick={handleNext}
                disabled={!isPremium || isSubmitting}
                className="bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white rounded-xl"
              >
                {isSubmitting ? "Generating key…" : (
                  <>
                    Get My Embed Key <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white rounded-xl"
              >
                {step === 2 ? (
                  <>
                    Continue to Subscribe <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispensaryOnboarding;
