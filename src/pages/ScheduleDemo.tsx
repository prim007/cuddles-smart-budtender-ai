import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Zap, Store, ShoppingCart, Users, CreditCard, Database, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  company: z.string().min(2, "Company name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(20),
  dispensaryCount: z.string(),
  currentPOS: z.string(),
  message: z.string().max(1000).optional(),
  preferredDate: z.date().optional(),
  // Honeypot field - should always be empty (bots fill this)
  website: z.string().max(0, "").optional(),
});

type FormData = z.infer<typeof formSchema>;

const integrations = [
  {
    icon: Store,
    name: "POS Systems",
    color: "from-hippie-purple to-hippie-pink",
    systems: ["Dutchie", "Jane", "Cova", "Flowhub", "Treez", "GreenBits"]
  },
  {
    icon: ShoppingCart,
    name: "E-Commerce",
    color: "from-hippie-orange to-hippie-yellow",
    systems: ["Shopify", "WooCommerce", "Weedmaps", "Leafly"]
  },
  {
    icon: Database,
    name: "Inventory Management",
    color: "from-hippie-green to-hippie-blue",
    systems: ["METRC", "BioTrack", "LeafLogix", "Alpine IQ"]
  },
  {
    icon: Users,
    name: "CRM & Loyalty",
    color: "from-hippie-pink to-hippie-purple",
    systems: ["SpringBig", "Alpine IQ", "Baker", "Zenreach"]
  },
  {
    icon: CreditCard,
    name: "Payment Processing",
    color: "from-hippie-yellow to-hippie-orange",
    systems: ["Hypur", "PayQwick", "CanPay", "Aeropay"]
  },
  {
    icon: Cloud,
    name: "Cloud & Analytics",
    color: "from-hippie-blue to-hippie-green",
    systems: ["Headset", "Google Analytics", "Salesforce", "Custom APIs"]
  },
];

const ScheduleDemo = () => {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadTime] = useState<number>(Date.now());
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    // Anti-bot check #1: Honeypot field should be empty
    if (data.website && data.website.length > 0) {
      // Silently reject bot submissions
      toast({
        title: "Demo Scheduled! ✨",
        description: "We'll reach out within 24 hours to confirm your demo time.",
      });
      return;
    }

    // Anti-bot check #2: Form should take at least 3 seconds to fill
    const timeTaken = Date.now() - formLoadTime;
    if (timeTaken < 3000) {
      // Too fast - likely a bot
      toast({
        title: "Please slow down",
        description: "Please take your time filling out the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('demo_requests')
        .insert({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          company: data.company.trim(),
          phone: data.phone.trim(),
          store_count: data.dispensaryCount,
          current_systems: data.currentPOS,
          preferred_date: data.preferredDate?.toISOString().split('T')[0],
          message: data.message?.trim(),
        });

      if (error) throw error;

      toast({
        title: "Demo Scheduled! ✨",
        description: "We'll reach out within 24 hours to confirm your demo time.",
      });

      // Reset form and date
      setDate(undefined);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting demo request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error scheduling your demo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <SEO 
        title="Schedule a Demo - Cuddles"
        description="Schedule a personalized demo of Cuddles AI-powered cannabis recommendation platform. See how we can transform your dispensary's customer experience."
        url="/schedule-demo"
      />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-hippie-pink/20">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-hippie-pink">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hippie-purple rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hippie-orange rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-groovy mb-6 bg-gradient-to-r from-hippie-yellow via-hippie-pink to-hippie-purple bg-clip-text text-transparent">
              Schedule Your Demo
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90">
              See how Cuddles transforms your cannabis retail experience in just 30 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Demo Form */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-hippie-pink/30">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@dispensary.com"
                    className="mt-2"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="company">Company/Dispensary Name *</Label>
                  <Input
                    id="company"
                    {...register("company")}
                    placeholder="Green Valley Dispensary"
                    className="mt-2"
                  />
                  {errors.company && (
                    <p className="text-sm text-red-500 mt-1">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+1 (555) 123-4567"
                    className="mt-2"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dispensaryCount">Number of Locations *</Label>
                  <Select onValueChange={(value) => setValue("dispensaryCount", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select number of locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Location</SelectItem>
                      <SelectItem value="2-5">2-5 Locations</SelectItem>
                      <SelectItem value="6-10">6-10 Locations</SelectItem>
                      <SelectItem value="10+">10+ Locations</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.dispensaryCount && (
                    <p className="text-sm text-red-500 mt-1">{errors.dispensaryCount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentPOS">Current POS System *</Label>
                  <Select onValueChange={(value) => setValue("currentPOS", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your current POS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dutchie">Dutchie</SelectItem>
                      <SelectItem value="jane">Jane</SelectItem>
                      <SelectItem value="cova">Cova</SelectItem>
                      <SelectItem value="flowhub">Flowhub</SelectItem>
                      <SelectItem value="treez">Treez</SelectItem>
                      <SelectItem value="greenbits">GreenBits</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="none">No POS Yet</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currentPOS && (
                    <p className="text-sm text-red-500 mt-1">{errors.currentPOS.message}</p>
                  )}
                </div>

                <div>
                  <Label>Preferred Demo Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-2 justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          if (selectedDate) setValue("preferredDate", selectedDate);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="message">Additional Notes (Optional)</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Tell us about your specific needs or questions..."
                    className="mt-2 min-h-[100px]"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Honeypot field - hidden from real users, bots fill it */}
                <div 
                  className="absolute -left-[9999px] -top-[9999px]" 
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...register("website")}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white text-lg py-6"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Demo"}
                </Button>
              </form>
            </Card>

            {/* What to Expect */}
            <div className="space-y-6">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-hippie-yellow/30">
                <h3 className="text-2xl font-groovy text-foreground mb-4">What to Expect</h3>
                <ul className="space-y-3">
                  {[
                    "30-minute personalized walkthrough",
                    "Live demo tailored to your dispensary needs",
                    "Q&A session with our product experts",
                    "Custom integration plan discussion",
                    "Pricing and implementation timeline",
                    "ROI analysis for your specific setup"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-hippie-green mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-hippie-purple/10 to-hippie-pink/10 border-hippie-pink/30">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-hippie-yellow" />
                  <h3 className="text-xl font-bubble font-bold text-foreground">Why Cuddles?</h3>
                </div>
                <ul className="space-y-2 text-foreground/80">
                  <li>• 95% recommendation accuracy</li>
                  <li>• Sub-2 second response time</li>
                  <li>• 35% increase in average order value</li>
                  <li>• 40% improvement in customer retention</li>
                  <li>• Seamless integration with your existing systems</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-groovy text-foreground mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-foreground/80">
              Cuddles connects with all major cannabis retail systems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <Card
                  key={integration.name}
                  className="p-6 bg-card/50 backdrop-blur-sm border-hippie-pink/20 hover:border-hippie-pink/50 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center",
                      integration.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bubble font-bold text-foreground">
                      {integration.name}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {integration.systems.map((system) => (
                      <li key={system} className="text-foreground/70 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-hippie-green" />
                        {system}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          <Card className="mt-12 p-8 bg-gradient-to-br from-hippie-blue/10 to-hippie-purple/10 border-hippie-blue/30">
            <div className="text-center">
              <h3 className="text-2xl font-groovy text-foreground mb-4">
                Don't See Your System?
              </h3>
              <p className="text-lg text-foreground/80 mb-6">
                We offer custom API integrations to connect with any platform. Our team will work with you to ensure seamless connectivity.
              </p>
              <Button className="bg-gradient-to-r from-hippie-blue to-hippie-purple text-white">
                Discuss Custom Integration
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ScheduleDemo;