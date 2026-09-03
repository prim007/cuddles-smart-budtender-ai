import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import CuddlesFeatures from "@/components/CuddlesFeatures";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import FAQSection from "@/components/FAQSection";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import SignupCTA from "@/components/SignupCTA";

import ComplianceSection from "@/components/ComplianceSection";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://cuddles-ai.com/#business",
  name: "Tripple444",
  alternateName: ["Tripple 444", "Cuddles AI by Tripple444", "Tripple444 Cannabis"],
  description:
    "Tripple444 is a cannabis business powered by Cuddles AI — offering AI-powered strain recommendations, product catalog, and delivery via WhatsApp.",
  url: "https://cuddles-ai.com",
  logo: "https://cuddles-ai.com/pwa-512x512.png",
  image: "https://cuddles-ai.com/og-image.jpg",
  telephone: "+27645436734",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cape Town",
    addressRegion: "Western Cape",
    addressCountry: "ZA",
  },
  geo: { "@type": "GeoCoordinates", latitude: "-33.9249", longitude: "18.4241" },
  priceRange: "$$",
  currenciesAccepted: "ZAR",
  paymentAccepted: "Cash, EFT, WhatsApp Order",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "22:00",
  },
  sameAs: ["https://wa.me/c/27645436734"],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+27645436734",
    contactType: "sales",
    areaServed: "ZA",
    availableLanguage: ["English", "Afrikaans"],
  },
  serviceArea: { "@type": "Place", name: "Cape Town, South Africa" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Tripple444 Products & Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Strain Recommendations by Cuddles" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cannabis Product Catalog" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "WhatsApp Ordering & Delivery" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cannabis Strain Journal & Tracking" } },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I buy cannabis online in South Africa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cuddles AI helps you find premium cannabis products — vapes from R390, oils from R320, and curated strains — with same-day delivery in Johannesburg, Cape Town and Pretoria via our partner Tripple444.",
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
      name: "How fast is cannabis delivery in South Africa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Same-day delivery is available in Johannesburg, Cape Town and Pretoria for orders placed before cut-off. Other regions ship within 1–3 business days.",
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
      name: "How much does a vape cost on Cuddles AI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All vapes are R390 and cannabis oils are R320 across the Tripple444 catalog, with same-day delivery in major South African cities.",
      },
    },
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen md:pt-20">
      <SEO
        title="Cuddles AI — Free AI Plant Expert & Cannabis Budtender"
        description="Free AI plant companion and cannabis budtender. Plant care and grow help, personalized strain picks in seconds, photo scanning, journal and reviews. Used worldwide."
        url="/"
        keywords="AI plant expert, plant care AI, AI budtender, cannabis AI, strain recommendations, houseplant help, grow assistant, weed strain finder, indica vs sativa, terpene guide, strain scanner, cannabis journal, Cuddles AI, dispensary AI"

      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <ThemeToggle />

      <Hero />
      <main>
        <div id="chat-demo">
          <ChatDemo />
        </div>
        <HowItWorks />
        <CuddlesFeatures />
        <FeaturedBlogPosts />
        <FAQSection />
        <ComplianceSection />
        <SignupCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
