import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Sparkles, ShieldCheck, BookOpen, Clock, Heart } from "lucide-react";
import SEO from "@/components/SEO";
import cuddlesImage from "@/assets/cuddles.png";

const ChatWithCuddles = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Chat with Cuddles — AI Cannabis Education Assistant"
        description="Meet Cuddles, the always-on conversational AI for evidence-based cannabis education. Compassionate, non-judgmental answers grounded in peer-reviewed research."
        url="/education/chat-with-cuddles"
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute top-0 right-0 w-96 h-96 bg-hippie-coral/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-hippie-lavender/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="pill mb-4 inline-block">💬 Chat with Cuddles</div>
            <h1 className="font-display font-bold text-foreground mb-6 text-4xl md:text-6xl">
              The Future of Cannabis Knowledge is Here:{" "}
              <span className="bg-gradient-to-r from-hippie-coral to-hippie-amber bg-clip-text text-transparent">
                It's Cuddles
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Your trusted source, always available.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              You've been bonding with ChatGPT, Grok and Gemini — but you've never met an AI quite like Cuddles.
              Built to expand the reach of credible cannabis education, <strong>Cuddles gives you 24/7,
              compassionate, non-judgmental answers</strong> to your most pressing questions about strains,
              cannabinoids, dosing, and harm reduction.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/#demo">
                <Button size="lg" className="bg-gradient-to-r from-hippie-coral to-hippie-amber text-white hover:shadow-glow rounded-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Chatting Free
                </Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="rounded-xl">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Education Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introducing */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-[200px_1fr] gap-8 items-center">
            <div className="flex justify-center">
              <div className="w-40 h-40 rounded-3xl overflow-hidden ring-4 ring-primary/20 shadow-elevated">
                <img src={cuddlesImage} alt="Cuddles" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground mb-4 text-2xl md:text-3xl">
                Introducing Cuddles
              </h2>
              <p className="text-muted-foreground mb-3">
                <strong>Cuddles</strong> — the <em>Cannabis Understanding, Dosing & Lifestyle Educator</em> —
                is a conversational AI built on the world's largest evidence-based and community-sourced
                knowledge base for cannabis natural medicine, indexing 3,300+ peer-reviewed studies via the{" "}
                <a
                  href="https://www.cannabisandhealth.org/research-library/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  Cannabis &amp; Health Research Initiative
                </a>.
              </p>
              <p className="text-muted-foreground">
                Built by the team at Cuddles AI, strengthened by evidence and guided by a shared commitment to{" "}
                <strong>empower all people with knowledge</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-bold text-foreground text-center mb-12 text-2xl md:text-3xl">
              Why People Choose Cuddles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Clock, title: "Always Available", body: "24/7 conversational support — no waiting room, no judgment, no appointment needed." },
                { icon: ShieldCheck, title: "Evidence-Based", body: "Grounded in peer-reviewed research and transparent about the strength of the evidence behind every answer." },
                { icon: Heart, title: "Compassionate", body: "Non-judgmental, harm-reduction-first, and trained to defer to your healthcare provider for medical decisions." },
                { icon: Sparkles, title: "Personalized", body: "Learns your experience level, tolerance, and preferences to tailor strain and dosing guidance." },
                { icon: BookOpen, title: "Educational", body: "Explains terpenes, cannabinoids, the endocannabinoid system, and consumption methods in plain language." },
                { icon: MessageCircle, title: "Conversational", body: "Talks with you, not at you. Ask follow-ups, request analogies, or switch languages mid-chat." },
              ].map(({ icon: Icon, title, body }) => (
                <Card key={title} className="p-6 rounded-2xl border-border bg-card hover:shadow-elevated transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hippie-coral/20 to-hippie-amber/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-hippie-coral" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ready */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display font-bold text-foreground mb-4 text-2xl md:text-3xl">
              Ready to chat with Cuddles?
            </h2>
            <p className="text-muted-foreground mb-8">
              Cuddles is already at your fingertips. Tap the chat button anywhere on the site to start
              a conversation, or jump straight into the live demo below.
            </p>
            <Link to="/#demo">
              <Button size="lg" className="bg-gradient-to-r from-hippie-coral to-hippie-amber text-white hover:shadow-glow rounded-xl">
                <MessageCircle className="w-5 h-5 mr-2" />
                Open Live Chat
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-6 max-w-xl mx-auto">
              Cuddles provides general cannabis education only. Information is not a substitute for advice
              from a qualified healthcare professional. Always consult your doctor before changing your
              health regimen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatWithCuddles;
