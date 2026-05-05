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
import PhoneShowcase from "@/components/PhoneShowcase";
import PawDownloadCTA from "@/components/PawDownloadCTA";
import PawInstallPrompt from "@/components/PawInstallPrompt";

const Index = () => {
  return (
    <div className="min-h-screen md:pt-20">
      <VideoPopup />
      <PawInstallPrompt />
      <SEO
        title="Cuddles AI — Buy CBD Products Online Anywhere in South Africa | AI Budtender + Same-Day Delivery"
        description="Free AI cannabis budtender for South Africa. R390 vapes, R320 oils, premium strains with same-day delivery in Joburg, Cape Town & Pretoria. Chat with Cuddles to find your perfect match — no signup required."
        url="/"
        keywords="Buy CBD Products Online Anywhere in South Africa , weed delivery Johannesburg, cannabis delivery Cape Town, dagga delivery, AI budtender South Africa, R390 vape, cannabis oil delivery, online dispensary SA, Cuddles AI, smart budtender, weed strains South Africa, Tripple444"
      />
      <ThemeToggle />
      <OnboardingFlow />
      <Hero />
      <PhoneShowcase />
      <div id="chat-demo">
        <ChatDemo />
      </div>
      <StickyChatFAB />
      <TrendingStrainsTicker />
      <Testimonials />
      <StrainQuiz />
      <YouTubeSection />
      <PawDownloadCTA />
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
