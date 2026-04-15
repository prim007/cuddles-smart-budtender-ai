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
        title="Cuddles AI | The #1 Smart Budtender to Scale Your Dispensary Sales"
        description="AI-powered budtender that increases basket size by 35%, reduces wait times, and delivers personalized strain recommendations. Trusted by 2,500+ users. Free to try."
        url="/"
        keywords="AI budtender for dispensaries, cannabis retail automation, automated cannabis product recommendations, smart budtender, dispensary AI, reduce dispensary wait times, cannabis POS AI integration, dagga strains South Africa, strain recommendations"
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
