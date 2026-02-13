import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BarChart3, Brain, TrendingUp, Users, ShoppingCart, Zap, CheckCircle2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const demoFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  company: z.string().min(2, "Company name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20).optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  website: z.string().max(0, "").optional(), // honeypot
});

type DemoFormData = z.infer<typeof demoFormSchema>;

const benefits = [
  {
    icon: BarChart3,
    title: "Real-Time Sales Analytics",
    description: "Understand what strains sell best, when peak hours are, and which customer segments drive the most revenue — all powered by AI pattern recognition.",
  },
  {
    icon: Brain,
    title: "Smarter Inventory Decisions",
    description: "Cuddles analyzes purchase trends and customer preferences to help suppliers stock what actually sells, reducing waste and dead inventory by up to 30%.",
  },
  {
    icon: TrendingUp,
    title: "Increase Average Order Value",
    description: "AI-powered upsell and cross-sell recommendations increase basket sizes. Dispensaries using smart recommendations see 20-35% higher average order values.",
  },
  {
    icon: Users,
    title: "Know Your Customer Better",
    description: "Build detailed customer profiles based on preferences, effects sought, and purchase history — enabling targeted marketing and personalized experiences.",
  },
  {
    icon: ShoppingCart,
    title: "Streamlined Supplier-Retailer Pipeline",
    description: "Suppliers gain visibility into retail demand patterns, enabling better production planning, pricing strategies, and distribution decisions.",
  },
  {
    icon: Zap,
    title: "Competitive Edge Through AI",
    description: "The cannabis industry is rapidly evolving. Businesses using AI recommendations convert 40% more browsers into buyers compared to traditional methods.",
  },
];

const stats = [
  { value: "35%", label: "Higher average order value with AI recommendations", source: "Headset Industry Report" },
  { value: "40%", label: "Better customer retention with personalized experiences", source: "McKinsey Retail Study" },
  { value: "30%", label: "Reduction in dead inventory with demand forecasting", source: "Cannabis Business Times" },
  { value: "<2s", label: "Real-time recommendation speed per customer query", source: "Cuddles Platform" },
];

const WhyCuddles = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formLoadTime] = useState<number>(Date.now());
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
  });

  const onSubmit = async (data: DemoFormData) => {
    // Honeypot check
    if (data.website && data.website.length > 0) {
      setSubmitted(true);
      return;
    }

    // Timing check
    if (Date.now() - formLoadTime < 3000) {
      toast({
        title: "Please slow down",
        description: "Please take your time filling out the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-demo-email", {
        body: {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          company: data.company.trim(),
          phone: data.phone?.trim() || "Not provided",
          message: data.message?.trim() || "No additional message",
        },
      });

      if (error) throw error;

      setSubmitted(true);
      reset();
      toast({
        title: "Demo Request Sent! ✨",
        description: "We'll be in touch within 24 hours.",
      });
    } catch (error) {
      console.error("Error sending demo request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error. Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title="Why Cuddles AI - Transform Cannabis Retail with AI Analytics"
        description="Discover how Cuddles AI helps cannabis suppliers and dispensaries understand sales better, optimize inventory, and increase revenue with AI-powered insights."
        url="/why-cuddles"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
            For Suppliers & Dispensaries
          </p>
          <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-6xl leading-tight">
            Why Your Business <span className="gradient-text">Needs Cuddles AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Cannabis businesses lose millions in revenue from poor inventory decisions, generic customer experiences, and lack of data insights. Cuddles AI changes that.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#demo-form">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-lg px-8 py-6 h-auto rounded-xl gap-2">
                <Send className="w-5 h-5" />
                Schedule a Demo
              </Button>
            </a>
            <Link to="/schedule-demo">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display font-medium text-lg px-8 py-6 h-auto rounded-xl">
                Full Demo Details
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center bg-card border-border">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-sm text-muted-foreground leading-snug">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">
              How Cuddles AI Helps Your Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From smarter stocking to higher sales, here's what AI-powered recommendations deliver.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="p-8 bg-card border-border hover:border-primary/20 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-card-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12 bg-card border-border">
            <h2 className="font-display font-bold text-foreground mb-6 text-2xl md:text-3xl">
              The Problem Without AI
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display font-semibold text-destructive mb-3">❌ Without Cuddles</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3"><span>•</span><span>Guesswork-based inventory ordering</span></li>
                  <li className="flex gap-3"><span>•</span><span>Generic recommendations that don't convert</span></li>
                  <li className="flex gap-3"><span>•</span><span>No visibility into customer preference trends</span></li>
                  <li className="flex gap-3"><span>•</span><span>Suppliers blind to retail demand signals</span></li>
                  <li className="flex gap-3"><span>•</span><span>High product waste and missed sales</span></li>
                </ul>
              </div>
              <div>
                <h3 className="font-display font-semibold text-primary mb-3">✅ With Cuddles AI</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span>Data-driven stocking based on real demand</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span>Personalized recommendations that boost sales</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span>Real-time analytics on what's trending</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span>Suppliers see exactly what retailers need</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span>Optimized inventory = higher margins</span></li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Demo Form */}
      <section id="demo-form" className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">
              Schedule a Demo
            </h2>
            <p className="text-lg text-muted-foreground">
              See how Cuddles AI can transform your business. We'll get back to you within 24 hours.
            </p>
          </div>

          {submitted ? (
            <Card className="p-10 text-center bg-card border-primary/30">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">Request Received!</h3>
              <p className="text-muted-foreground mb-6">
                We've sent your demo request to our team. Expect to hear from us within 24 hours.
              </p>
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-8 bg-card border-border">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="demo-name">Full Name *</Label>
                  <Input id="demo-name" {...register("name")} placeholder="Your full name" className="mt-2" />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="demo-email">Email *</Label>
                  <Input id="demo-email" type="email" {...register("email")} placeholder="you@company.com" className="mt-2" />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="demo-company">Company / Business Name *</Label>
                  <Input id="demo-company" {...register("company")} placeholder="Your dispensary or brand" className="mt-2" />
                  {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
                </div>

                <div>
                  <Label htmlFor="demo-phone">Phone (Optional)</Label>
                  <Input id="demo-phone" type="tel" {...register("phone")} placeholder="+27 xxx xxx xxxx" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="demo-message">Tell us about your business (Optional)</Label>
                  <Textarea id="demo-message" {...register("message")} placeholder="What challenges are you facing? How many locations do you have?" className="mt-2 min-h-[100px]" />
                </div>

                {/* Honeypot */}
                <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true" tabIndex={-1}>
                  <Label htmlFor="hp-website">Website</Label>
                  <Input id="hp-website" {...register("website")} autoComplete="off" tabIndex={-1} />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-lg py-6 h-auto rounded-xl gap-2">
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Sending..." : "Request a Demo"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default WhyCuddles;
