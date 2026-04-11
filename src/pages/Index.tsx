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
        title="Cuddles AI - South Africa's Smartest Cannabis Budtender | Strain Recommendations"
        description="Get personalized cannabis strain recommendations from Cuddles AI. Find your perfect indica, sativa, or hybrid based on effects, terpenes & experience. Trusted by 2,400+ South African users. Free."
        url="/"
        keywords="cannabis South Africa, AI budtender, dagga strains, strain recommendations, best strains for sleep, cannabis delivery SA, CBD oil South Africa, weed recommendations, terpene guide, indica vs sativa, Cuddles AI, dispensary near me"
      />
      <ThemeToggle />
      <OnboardingFlow />
      <Hero />
      <YouTubeSection />
      <TrendingStrainsTicker />
      <div id="chat-demo">
        <ChatDemo />
      </div>
      <StickyChatFAB />
      <StrainQuiz />
      <Testimonials />
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
