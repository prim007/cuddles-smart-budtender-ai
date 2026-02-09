import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CuddlesFeatures from "@/components/CuddlesFeatures";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import InvestorCTA from "@/components/InvestorCTA";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Cuddles AI - The World's Smartest Cannabis Budtender | AI Strain Recommendations"
        description="Cuddles AI is the smartest AI-powered cannabis budtender. Get personalized strain recommendations, track your cannabis journal, scan strains with AI, read community reviews, and manage tolerance breaks. Free to use worldwide."
        url="/"
        keywords="Cuddles AI, cannabis AI, smart budtender, AI budtender, strain recommendations, cannabis recommendations, weed AI, marijuana AI, cannabis technology, dispensary AI, strain finder, cannabis app, best cannabis AI, cannabis community"
      />
      <ThemeToggle />
      <OnboardingFlow />
      <Hero />
      <CuddlesFeatures />
      <Features />
      <HowItWorks />
      <ChatDemo />
      <InvestorCTA />
      <Footer />
    </div>
  );
};

export default Index;
