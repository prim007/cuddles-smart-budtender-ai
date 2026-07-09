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

import TrendingStrainsTicker from "@/components/TrendingStrainsTicker";
import StrainQuiz from "@/components/StrainQuiz";
import Testimonials from "@/components/Testimonials";
import YouTubeSection from "@/components/YouTubeSection";
import PhoneShowcase from "@/components/PhoneShowcase";
import PawDownloadCTA from "@/components/PawDownloadCTA";

const Index = () => {
  return (
    <div className="min-h-screen md:pt-20">
      <SEO
        title="Cuddles AI — Free AI Cannabis Budtender"
        description="Free AI cannabis budtender. Personalized strain picks in seconds, scan strains with your camera, track your journal, read reviews. Used worldwide."
        url="/"
        keywords="AI budtender, cannabis AI, strain recommendations, weed strain finder, indica vs sativa, terpene guide, strain scanner, cannabis journal, strain reviews, smart budtender, Cuddles AI, dispensary AI, cannabis education, THC CBD guide"
      />
      <ThemeToggle />
      
      <Hero />
      <PhoneShowcase />
      <div id="chat-demo">
        <ChatDemo />
      </div>
      
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
