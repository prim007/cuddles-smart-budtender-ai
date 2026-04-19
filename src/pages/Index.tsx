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
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import SignupCTA from "@/components/SignupCTA";
import VideoPopup from "@/components/VideoPopup";
import StickyChatFAB from "@/components/StickyChatFAB";
import TrendingStrainsTicker from "@/components/TrendingStrainsTicker";
import StrainQuiz from "@/components/StrainQuiz";
import Testimonials from "@/components/Testimonials";
import YouTubeSection from "@/components/YouTubeSection";

const Index = () => {
  return (
    <div className="min-h-screen md:pt-20">
      
      <VideoPopup />
      <SEO 
        title="Cuddles AI — Smart Cannabis Budtender & AI Strain Finder"
        description="Free AI cannabis budtender. Get personalized strain recommendations in seconds, scan strains by photo, track your journal, and shop verified dispensaries. Used by 2,500+."
        url="/"
        keywords="AI budtender, smart budtender, cannabis AI, AI strain finder, strain recommendations, cannabis app, weed strain guide, dispensary AI, cannabis POS integration, strain scanner, cannabis journal, dagga South Africa"
      />
      <ThemeToggle />
      <OnboardingFlow />
      <Hero />
      <div id="chat-demo">
        <ChatDemo />
      </div>
      <StickyChatFAB />
      <TrendingStrainsTicker />
      <Testimonials />
      <StrainQuiz />
      <YouTubeSection />
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
