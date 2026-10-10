import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, CheckCircle2, Gift, Sparkles } from "lucide-react";
import { trackEvent, trackSignupComplete } from "@/components/GoogleAnalytics";
import SEO from "@/components/SEO";

const emailSchema = z.string().email("Please enter a valid email address");

const Claim = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  const promoFromUrl = params.get("code");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  // Best-effort: fetch promo code for this email lead if not passed in URL
  useEffect(() => {
    const fetchCode = async () => {
      if (promoFromUrl) {
        setPromoCode(promoFromUrl);
        return;
      }
      if (!email) return;
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) return;
      const { data } = await supabase
        .from("email_leads")
        .select("promo_code")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();
      if (data?.promo_code) setPromoCode(data.promo_code);
    };
    fetchCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMagicLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    trackEvent("cta_click", "signup", "claim_magic_link");
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        shouldCreateUser: true,
      },
    });
    setSending(false);
    if (otpError) {
      setError(otpError.message);
      toast({
        title: "Couldn't send link",
        description: otpError.message,
        variant: "destructive",
      });
      return;
    }
    setSent(true);
    trackSignupComplete("claim_magic_link");
    toast({ title: "Check your inbox 📩", description: "We sent you a magic sign-in link." });
  };

  const signInWithGoogle = async () => {
    trackEvent("cta_click", "signup", "claim_google");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({
        title: "Google Sign-In Failed",
        description: "Please try again or use email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <SEO
        title="Claim Your Account — Cuddles AI"
        description="One click to claim your Cuddles account and unlock your 15% discount code."
        url="/claim"
      />
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <Card className="shadow-elevated">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold leading-none tracking-tight">
              Claim your account
            </h1>
            <CardDescription className="text-base">
              {promoCode ? (
                <>Your <strong>15% discount code</strong> is ready — create your free account in one tap.</>
              ) : (
                <>Finish creating your free account to save your chats and unlock rewards.</>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {promoCode && (
              <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Your promo code</p>
                <p className="font-mono text-xl font-bold text-primary tracking-widest">{promoCode}</p>
              </div>
            )}

            {sent ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                <p className="font-semibold text-foreground">Check your inbox!</p>
                <p className="text-sm text-muted-foreground">
                  We sent a magic sign-in link to <strong>{email}</strong>. Tap it to activate your account instantly.
                </p>
                <p className="text-xs text-muted-foreground pt-2">
                  Wrong email?{" "}
                  <button className="underline text-primary" onClick={() => setSent(false)}>
                    Use a different one
                  </button>
                </p>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full h-11 text-base"
                  onClick={signInWithGoogle}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or magic link (no password)</span>
                  </div>
                </div>

                <form onSubmit={sendMagicLink} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="claim-email">Your email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="claim-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10 h-11"
                        disabled={sending}
                        autoFocus={!email}
                      />
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-2"
                    disabled={sending}
                  >
                    <Sparkles className="h-4 w-4" />
                    {sending ? "Sending..." : "Send me a magic sign-in link"}
                  </Button>
                </form>

                <p className="text-[11px] text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link to="/auth" className="text-primary underline">Sign in</Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Claim;
