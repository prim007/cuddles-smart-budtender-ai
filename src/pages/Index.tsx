import { Helmet } from "react-helmet-async";
import { Suspense, lazy } from "react";
import Hero from "@/components/Hero";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";

// Everything below the banner loads after first paint. Each placeholder keeps
// the same height as its section so nothing jumps around while loading.
const ChatDemo = lazy(() => import("@/components/ChatDemo"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const CuddlesFeatures = lazy(() => import("@/components/CuddlesFeatures"));
const FeaturedBlogPosts = lazy(() => import("@/components/FeaturedBlogPosts"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ComplianceSection = lazy(() => import("@/components/ComplianceSection"));
const SignupCTA = lazy(() => import("@/components/SignupCTA"));
const Footer = lazy(() => import("@/components/Footer"));

const Placeholder = ({ height }: { height: string }) => (
  <div style={{ minHeight: height }} aria-hidden="true" />
);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I buy cannabis online in South Africa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not in the way you'd buy other goods — buying and selling cannabis is still not legal in South Africa. What Cuddles AI can do is explain the current rules and point you to private clubs and licensed partners near you, including our partner Tripple444, whose catalogue you can browse and ask about directly.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Cuddles AI plant expert and budtender work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Just chat with Cuddles. Ask about any plant — a struggling houseplant, herbs, vegetables or a cannabis grow — or tell it how you want to feel and it recommends the right strain, vape or oil instantly. No signup required to start.",

      },
    },
    {
      "@type": "Question",
      name: "Can Cuddles AI find a dispensary near me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Tell Cuddles your city or town, or use the dispensary finder on this site, and it lists nearby clubs and shops with distances and directions so you can call ahead and ask what they have in stock.",
      },
    },
    {
      "@type": "Question",
      name: "Is Cuddles AI free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the AI plant expert and budtender is 100% free. Cuddles Premium (R99/month) unlocks advanced features like the strain journal, tolerance break coach, and seedling monitor.",
      },
    },
    {
      "@type": "Question",
      name: "What do cannabis products cost in South Africa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prices differ between shops, products and sizes, so Cuddles shows you what each partner has listed rather than one fixed price. Ask Cuddles for a product and it will tell you which partner lists it and how to contact them for the current price.",
      },
    },
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen md:pt-20">
      <SEO
        title="Cuddles AI — Cannabis Budtender South Africa | Free AI Plant Expert"
        description="Free AI plant companion and cannabis budtender. Plant care and grow help, personalized strain picks in seconds, photo scanning, journal and reviews. Built in South Africa."
        url="/"
        keywords="AI plant expert, plant care AI, AI budtender, cannabis AI, strain recommendations, houseplant help, grow assistant, weed strain finder, indica vs sativa, terpene guide, strain scanner, cannabis journal, Cuddles AI, dispensary AI"

      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <ThemeToggle />

      <Hero />
      <main>
        <div id="chat-demo">
          <Suspense fallback={<Placeholder height="600px" />}>
            <ChatDemo />
          </Suspense>
        </div>
        <Suspense fallback={<Placeholder height="700px" />}>
          <HowItWorks />
          <CuddlesFeatures />
          <FeaturedBlogPosts />
          <FAQSection />
          <ComplianceSection />
          <SignupCTA />
        </Suspense>
      </main>
      <Suspense fallback={<Placeholder height="400px" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
