import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CuddlesFeatures from "@/components/CuddlesFeatures";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import InvestorCTA from "@/components/InvestorCTA";
import FAQSection from "@/components/FAQSection";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import SignupPromoModal from "@/components/SignupPromoModal";

import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import SignupCTA from "@/components/SignupCTA";
import VideoPopup from "@/components/VideoPopup";
import StickyChatFAB from "@/components/StickyChatFAB";

const Index = () => {
  return (
    <div className="min-h-screen md:pt-20">
      <SignupPromoModal />
      <VideoPopup />
      <SEO 
        title="Cuddles AI - The World's Smartest Cannabis Budtender | AI Strain Recommendations"
        description="Get personalized cannabis strain recommendations from Cuddles AI, the smartest AI budtender. Find your perfect indica, sativa, or hybrid strain based on desired effects, terpene profiles, and experience level. Free to use."
        url="/"
        keywords="cannabis AI, AI budtender, strain recommendations, weed recommendations, cannabis strain finder, best strains for sleep, best strains for anxiety, terpene guide, indica vs sativa, CBD vs THC, smart budtender, dispensary AI, Cuddles AI"
      />
      <ThemeToggle />
      <OnboardingFlow />
      <Hero />
      <div id="chat-demo">
        <ChatDemo />
      </div>
      <StickyChatFAB />
      
      <CuddlesFeatures />
      <FeaturedBlogPosts />
      <Features />
      <HowItWorks />
      <FAQSection />
      <InvestorCTA />
      <SignupCTA />
      <Footer />
    </div>
  );
};

export default Index;
