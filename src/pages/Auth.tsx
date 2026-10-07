import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, LogIn, UserPlus, ArrowLeft, Leaf, BookOpen, Star, Shield } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";
import SEO from "@/components/SEO";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

const BENEFITS = [
  { icon: Leaf, text: "Personalized strain recommendations" },
  { icon: BookOpen, text: "Track your sessions in a private journal" },
  { icon: Star, text: "Rate & review strains you've tried" },
  { icon: Shield, text: "Monitor your seedlings with AI tips" },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [activeTab, setActiveTab] = useState("signup");

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Sanitize `next` — only same-origin relative paths starting with a single slash.
  const rawNext = searchParams.get("next") ?? "";
  const nextPath = /^\/(?!\/)[^\s]*$/.test(rawNext) ? rawNext : "/dashboard";

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${nextPath}`,
    });
    if (error) {
      toast({
        title: "Google Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: `${window.location.origin}${nextPath}`,
    });
    if (error) {
      toast({
        title: "Apple Sign-In Failed",
        description: "Could not sign in with Apple. Please try again.",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    if (user) navigate(nextPath);
  }, [user, navigate, nextPath]);

  const validateForm = (isSignup = false): boolean => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.issues[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.issues[0].message;
    if (isSignup && !name.trim()) newErrors.name = "Please enter your name";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const { error, user: signedInUser } = await signIn(email, password);
    setIsSubmitting(false);
    if (error) {
      let message = "An error occurred during sign in";
      if (error.message.includes("Invalid login credentials")) message = "Invalid email or password.";
      else if (error.message.includes("Email not confirmed")) message = "Please verify your email first.";
      toast({ title: "Sign In Failed", description: message, variant: "destructive" });
    } else {
      const meta = (signedInUser?.user_metadata ?? {}) as Record<string, unknown>;
      const raw = (meta.name || meta.full_name || meta.given_name || signedInUser?.email?.split("@")[0]) as string | undefined;
      const firstName = raw ? String(raw).trim().split(" ")[0] : "friend";
      toast({ title: `Welcome back, ${firstName}! 🌿`, description: "You have successfully signed in." });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    setIsSubmitting(true);
    const { error } = await signUp(email, password, name.trim(), nextPath);
    setIsSubmitting(false);
    if (error) {
      let message = "An error occurred during sign up";
      if (error.message.includes("User already registered")) message = "Account already exists. Try signing in.";
      else if (error.message.includes("Password")) message = error.message;
      toast({ title: "Sign Up Failed", description: message, variant: "destructive" });
    } else {
      const firstName = name.trim().split(" ")[0];
      toast({ title: `You're in, ${firstName}! 🎉`, description: "Check your email to verify your account." });
      setEmail("");
      setPassword("");
      setName("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <SEO
        title="Sign In or Create Your Cuddles AI Account"
        description="Sign in to Cuddles AI to save personalised strain recommendations, keep a private session journal, review strains and track your seedlings."
        url="/auth"
        keywords="Cuddles AI sign in, cannabis app login, create cannabis journal account"
        noindex
      />
      <div className="w-full max-w-lg">
        <h1 className="sr-only">Sign In or Sign Up to Cuddles AI</h1>
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <Card className="shadow-elevated">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-hippie-purple to-hippie-pink bg-clip-text text-transparent">
              Join 2,400+ Cuddles Users 🌿
            </CardTitle>
            <CardDescription className="text-base">
              Free forever — unlock your personal AI budtender in seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {BENEFITS.map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <b.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Google */}
            <Button variant="outline" className="w-full h-12 text-base" onClick={handleGoogleSignIn}>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google — fastest way in
            </Button>



            {/* Apple */}
            <Button variant="outline" className="w-full h-12 text-base" onClick={handleAppleSignIn}>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or use email</span>

            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Sign Up
                </TabsTrigger>
                <TabsTrigger value="signin">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" /> Sign In
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name">Your name</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" type="text" placeholder="What should Cuddles call you?" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11" disabled={isSubmitting} maxLength={50} />
                    </div>
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" disabled={isSubmitting} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="8+ characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11" disabled={isSubmitting} />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-hippie-purple to-hippie-pink hover:opacity-90 text-base font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Create Free Account
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">No credit card required • Unsubscribe anytime</p>
                </form>
              </TabsContent>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" disabled={isSubmitting} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11" disabled={isSubmitting} />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-hippie-purple to-hippie-pink hover:opacity-90 text-base font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
