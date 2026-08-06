import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldAlert } from "lucide-react";

const complianceFaqs = [
  {
    question: "Is there an age restriction for using Cuddles?",
    answer:
      "Yes. Cannabis features on Cuddles are intended for adults of legal age only — 18+ in South Africa and the legal minimum age in whichever jurisdiction you are in (21+ in most US states). By using the cannabis-related parts of the platform you confirm you meet that age requirement. General plant care features carry no age restriction.",
  },
  {
    question: "Does Cuddles give medical advice?",
    answer:
      "No. Everything Cuddles shares about strains, terpenes, dosing ranges and tolerance breaks is general education, not medical advice, diagnosis or treatment. Cannabis interacts with medications and affects people differently. Speak to a qualified healthcare professional before using cannabis for any health reason, and especially if you are pregnant, breastfeeding, or managing a mental-health condition.",
  },
  {
    question: "What does responsible use actually look like?",
    answer:
      "Start low and go slow — especially with edibles, which can take up to two hours to take effect. Never drive or operate machinery while impaired. Avoid mixing with alcohol or other substances. Keep all cannabis products sealed and out of reach of children and pets. If you find yourself relying on cannabis daily, our T-Break Coach can help you reset your tolerance.",
  },
  {
    question: "Is cannabis legal where I live?",
    answer:
      "Laws differ by country, province and city, and they change often. In South Africa, private adult use and cultivation are permitted under the Cannabis for Private Purposes Act, but commercial sale remains restricted. You are responsible for knowing and following the rules in your own jurisdiction — check our International Cannabis Map for a country-by-country overview before you act on anything you read here.",
  },
  {
    question: "Does Cuddles sell cannabis?",
    answer:
      "Cuddles is an information and recommendation platform. We do not sell, ship or broker cannabis. Where menus or dispensaries are shown, they belong to independent licensed or member-based operators who are responsible for their own compliance, verification and fulfilment.",
  },
  {
    question: "How do dispensaries stay compliant when using Cuddles?",
    answer:
      "The embeddable budtender supports age-gating before the first message, jurisdiction-aware response rules, and the removal of medical claims from AI answers. Recommendations are drawn from your own live inventory, so nothing is suggested that you cannot legally sell in your market.",
  },
];

const ComplianceSection = () => {
  return (
    <section className="py-20 bg-muted/30" aria-labelledby="compliance-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
            Safety &amp; Compliance
          </p>
          <h2 id="compliance-heading" className="font-display font-bold text-foreground mb-4 text-3xl md:text-4xl">
            Age gating, responsible use &amp; local law
          </h2>
          <p className="text-muted-foreground">
            Cuddles is built for adults, for education, and for markets where cannabis is legal.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-3 rounded-xl border border-border bg-card p-5">
            <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Disclaimer:</strong> Cannabis content on Cuddles is
              intended for adults of legal age (18+ in South Africa; 21+ where required) and is provided
              for general educational purposes only. It is not medical advice, and Cuddles does not sell
              or deliver cannabis. Cannabis can impair judgement and coordination — never drive or operate
              machinery while impaired, and keep products away from children and pets. You are responsible
              for complying with the laws of your own country, province or state.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {complianceFaqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`compliance-${index}`}
                className="bg-card border border-border rounded-xl px-6"
              >
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

export default ComplianceSection;
