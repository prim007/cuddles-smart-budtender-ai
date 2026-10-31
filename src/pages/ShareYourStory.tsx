import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  company: z.string().trim().min(2, "Please enter your shop or business name").max(100),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(60).optional(),
  story: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(1500),
  website: z.string().max(0).optional(), // honeypot
});
type FormData = z.infer<typeof schema>;

const ShareYourStory = () => {
  const [loadedAt] = useState(Date.now());
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    setProblem(null);
    if (d.website) return setSent(true);
    if (Date.now() - loadedAt < 3000) return setProblem("Please take a moment to fill in the form.");
    setSending(true);
    const message = [`[Story request]`, d.city ? `City: ${d.city}` : null, d.story].filter(Boolean).join("\n");
    try {
      const { error } = await supabase.from("demo_requests").insert({
        name: d.name,
        email: d.email.toLowerCase(),
        company: d.company,
        phone: d.phone || null,
        store_count: "story",
        current_systems: "Story request",
        message,
      });
      if (error) throw error;
      supabase.functions
        .invoke("send-demo-email", {
          body: { name: d.name, email: d.email.toLowerCase(), company: d.company, phone: d.phone || null, message },
        })
        .catch(() => undefined);
      setSent(true);
    } catch {
      setProblem("Something went wrong sending your request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Get Your Shop's Story Written | Cuddles AI"
        description="South African dispensaries, grow shops and plant businesses: tell us your story and we'll write a feature about you on the Cuddles AI blog."
        url="/share-your-story"
      />
      <main className="container mx-auto max-w-2xl px-4 pt-28 pb-12 space-y-8">
        <header className="space-y-3 text-center">
          <PenLine className="w-10 h-10 mx-auto text-primary" />
          <h1 className="text-3xl md:text-4xl font-display font-bold">Get your shop's story written</h1>
          <p className="text-muted-foreground">
            Run a dispensary, grow shop, nursery or plant business in South Africa? Tell us what makes you different
            and we'll write a feature about you on the Cuddles blog — free, and yours to share.
          </p>
        </header>

        {sent ? (
          <Card className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Thanks — we've got your story idea</h2>
            <p className="text-sm text-muted-foreground">
              We'll be in touch by email to set up a short chat. Know another shop with a story? Send them this page.
            </p>
            <ShareButtons
              path="/share-your-story"
              campaign="story_invite"
              text="Cuddles AI writes free features about South African plant and cannabis shops:"
              className="justify-center"
            />
          </Card>
        ) : (
          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {[
                { id: "name", label: "Your name *", type: "text" },
                { id: "email", label: "Email *", type: "email" },
                { id: "company", label: "Shop or business name *", type: "text" },
                { id: "city", label: "Town or city", type: "text" },
                { id: "phone", label: "Phone (optional)", type: "tel" },
              ].map((f) => (
                <div key={f.id}>
                  <Label htmlFor={f.id}>{f.label}</Label>
                  <Input id={f.id} type={f.type} className="mt-2" {...register(f.id as keyof FormData)} />
                  {errors[f.id as keyof FormData] && (
                    <p className="text-sm text-destructive mt-1">{errors[f.id as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}
              <div>
                <Label htmlFor="story">What should people know about you? *</Label>
                <Textarea
                  id="story"
                  className="mt-2 min-h-[140px]"
                  placeholder="How you started, what you sell or grow, what your customers love, what's changing for you…"
                  {...register("story")}
                />
                {errors.story && <p className="text-sm text-destructive mt-1">{errors.story.message}</p>}
              </div>
              <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
                <Label htmlFor="website">Website</Label>
                <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>
              {problem && <p className="text-sm text-destructive">{problem}</p>}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending…" : "Send my story idea"}
              </Button>
              <p className="text-xs text-muted-foreground">
                We only use these details to contact you about your story. See our{" "}
                <Link to="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link>. We write
                education-focused features and don't promote cannabis sales.
              </p>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ShareYourStory;
