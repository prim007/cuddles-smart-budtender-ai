import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Heart, Leaf, Loader2, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import cuddles from "@/assets/cuddles.png";

type SignupState = "ready" | "submitting" | "success" | "error";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SignupState>("ready");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setState("error");
      return;
    }

    setState("submitting");
    setError("");
    const { data, error: invokeError } = await supabase.functions.invoke("newsletter-subscribe", {
      body: { email: normalizedEmail, website: "" },
    });

    if (invokeError || data?.error) {
      setError(data?.error || "We couldn't subscribe you just now. Please try again.");
      setState("error");
      return;
    }

    setState("success");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <SEO
        title="Cuddles AI Newsletter — Plant Tips, Strain Guides & Updates"
        description="Join the free Cuddles AI newsletter for helpful plant care, strain guides, South African cannabis updates and partner specials."
        url="/newsletter"
        keywords="Cuddles AI newsletter, plant care newsletter, cannabis education South Africa, strain guides"
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-10 lg:gap-16">
        <div className="relative mx-auto flex w-full max-w-sm items-end justify-center self-end md:self-center">
          <div className="absolute bottom-4 h-16 w-3/4 rounded-full bg-hippie-sage/20 blur-2xl" aria-hidden="true" />
          <img
            src={cuddles}
            alt="Cuddles, the cheerful green leaf character, waving hello"
            width={768}
            height={768}
            className="relative h-auto max-h-[42vh] w-auto max-w-full object-contain md:max-h-[68vh]"
          />
        </div>

        <section className="mx-auto w-full max-w-xl self-start pb-10 md:self-center md:pb-0" aria-labelledby="newsletter-title">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
            <Leaf className="h-4 w-4" /> Cuddles AI
          </Link>

          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-hippie-sage">
            <Sparkles className="h-4 w-4" /> A little goodness for your inbox
          </div>

          <h1 id="newsletter-title" className="max-w-lg text-4xl leading-tight md:text-5xl">
            Grow your knowledge with Cuddles.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
            Get friendly plant care, thoughtful strain guides, South African cannabis updates and occasional partner specials.
          </p>

          {state === "success" ? (
            <div className="mt-8 border-l-4 border-hippie-sage bg-hippie-sage/10 p-5" role="status" aria-live="polite">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hippie-sage text-accent-foreground">
                  <Check className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">Almost there — check your inbox!</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    We sent you a confirmation email. Click the link inside to join the newsletter.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 max-w-lg" noValidate>
              <label htmlFor="newsletter-email" className="mb-2 block text-sm font-semibold">
                Your email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={320}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (state === "error") setState("ready");
                    }}
                    disabled={state === "submitting"}
                    aria-describedby="newsletter-note newsletter-error"
                    className="h-12 pl-10"
                  />
                </div>
                <Button type="submit" size="lg" disabled={state === "submitting" || !email.trim()} className="h-12 px-6">
                  {state === "submitting" ? <Loader2 className="animate-spin" /> : <Heart />}
                  {state === "submitting" ? "Joining…" : "Subscribe free"}
                </Button>
              </div>
              <div id="newsletter-error" className="min-h-7 pt-2 text-sm text-destructive" role="alert" aria-live="polite">
                {state === "error" ? error : ""}
              </div>
              <p id="newsletter-note" className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                <Check className="mt-1 h-4 w-4 shrink-0 text-hippie-sage" />
                Free, no spam, and you can unsubscribe any time. By subscribing, you agree to receive the Cuddles AI newsletter.
              </p>
            </form>
          )}

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
            <span>Plant care</span>
            <span>Strain education</span>
            <span>Local updates</span>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            General plant and cannabis education only. Not medical advice. Read our{" "}
            <Link to="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Newsletter;