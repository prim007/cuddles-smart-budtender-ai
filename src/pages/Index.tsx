import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import InvestorCTA from "@/components/InvestorCTA";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Cuddles - AI-Powered Cannabis Recommendations"
        description="Transform cannabis retail with AI that recommends perfect strains based on desired effects, experience level, and preferences. 95% match accuracy, <2s response time."
        url="/"
      />
      <ThemeToggle />
      <Hero />
      <Features />
      <HowItWorks />
      <ChatDemo />
      <InvestorCTA />
      <Footer />
    </div>
  );
};

export default Index;
