import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Cuddles AI?",
    answer: "Cuddles AI is the world's smartest AI-powered cannabis budtender. It uses advanced machine learning to recommend personalized cannabis strains based on your desired effects, experience level, and preferences."
  },
  {
    question: "How does the AI strain recommendation work?",
    answer: "Cuddles analyzes your preferences including desired effects (relaxation, energy, creativity), experience level, and flavor preferences to suggest the best cannabis strains for you. It learns from community reviews and scientific data."
  },
  {
    question: "Is Cuddles AI free to use?",
    answer: "Yes! Cuddles AI is free to use. You can chat with our AI budtender, browse community reviews, and read our blog without any cost. Create a free account to save your strain journal and track tolerance breaks."
  },
  {
    question: "What is the Strain Scanner?",
    answer: "The Strain Scanner uses AI image recognition to identify cannabis strains from photos. Simply upload or take a photo of your cannabis, and Cuddles will identify the strain and provide detailed information about its effects and characteristics."
  },
  {
    question: "What is a Tolerance Break Coach?",
    answer: "The T-Break Coach is an AI-guided program that helps you manage cannabis tolerance breaks. It provides personalized motivation, daily check-ins, and progress tracking to help you reset your tolerance effectively."
  },
  {
    question: "Can dispensaries use Cuddles AI?",
    answer: "Absolutely! Cuddles AI offers a white-label solution for dispensaries to embed our smart budtender directly into their website. It integrates with POS systems like Dutchie, Flowhub, Cova, and Sweed. Start with a free 14-day trial at cuddles-ai.com/dispensary-onboarding."
  },
  {
    question: "How does Cuddles AI increase dispensary sales?",
    answer: "Cuddles AI uses RAG (Retrieval-Augmented Generation) technology to deliver personalized, inventory-aware recommendations that increase basket size by 35%. It provides 24/7 automated customer engagement, reduces wait times by 50%, and captures after-hours web traffic that would otherwise bounce."
  },
  {
    question: "Is Cuddles AI available internationally?",
    answer: "Yes! Cuddles AI works in every legal cannabis market worldwide — including the US, Canada, Germany, Netherlands, South Africa, Thailand, and Australia. The platform supports multiple languages and adapts to local compliance requirements automatically."
  },
  {
    question: "What POS systems does Cuddles integrate with?",
    answer: "Cuddles AI integrates with major cannabis POS systems including Dutchie, Flowhub, Cova, and Sweed. The integration syncs your product catalog, inventory levels, and pricing in real-time so AI recommendations are always accurate."
  }
];

// Note: FAQPage JSON-LD is intentionally rendered once in index.html (SA buyer-intent FAQs)
// to avoid Google Search Console "Duplicate field FAQPage" warnings. Do not re-add schema here.

const FAQSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="font-display font-bold text-foreground mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about Cuddles AI
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left font-display font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
