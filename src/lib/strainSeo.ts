/**
 * Search-intent helpers for strain pages.
 * Builds the visible Q&A block (and matching FAQPage schema) around the
 * long-tail queries people actually type: "is X indica or sativa",
 * "X thc level", "X effects", "what does X taste like", "where to buy X".
 */

export interface StrainFaq {
  question: string;
  answer: string;
}

interface FaqInput {
  name: string;
  type: string;
  thcRange?: string | null;
  cbdRange?: string | null;
  effects?: string[];
  flavors?: string[];
  medicalUses?: string[];
  negatives?: string[];
  bestTime?: string | null;
  lineage?: string | null;
  terpene?: string | null;
}

const list = (arr?: string[], max = 4) =>
  (arr || []).slice(0, max).join(", ").toLowerCase();

export const buildStrainFaqs = (s: FaqInput): StrainFaq[] => {
  const t = s.type.toLowerCase();
  const faqs: StrainFaq[] = [];

  faqs.push({
    question: `Is ${s.name} indica or sativa?`,
    answer: `${s.name} is classified as a ${t} strain${
      s.lineage ? `, bred from ${s.lineage}` : ""
    }. ${
      t.includes("indica")
        ? "Indica-leaning genetics usually feel heavier in the body, which is why this one tends to suit evenings and winding down."
        : t.includes("sativa")
        ? "Sativa-leaning genetics usually feel brighter and more heady, which is why this one tends to suit daytime use."
        : "Hybrid genetics sit between the two, so the experience depends heavily on the individual batch and your own tolerance."
    }`,
  });

  faqs.push({
    question: `How strong is ${s.name}? What is the THC level?`,
    answer: s.thcRange
      ? `${s.name} typically tests around ${s.thcRange} THC${
          s.cbdRange ? ` and ${s.cbdRange} CBD` : ""
        }. Potency varies by grower, batch and cure, so always check the label or lab report on the product you actually buy — you can scan it with Cuddles to read the COA back to you.`
      : `Published THC figures for ${s.name} vary widely between growers and batches. Check the lab report on the specific product you're buying rather than relying on a general range — you can scan the label with Cuddles and it will read the numbers back to you.`,
  });

  if (s.effects?.length) {
    faqs.push({
      question: `What effects does ${s.name} have?`,
      answer: `People most often describe ${s.name} as ${list(
        s.effects,
      )}.${s.bestTime ? ` It is generally reported as a ${s.bestTime.toLowerCase()} strain.` : ""} Effects differ from person to person depending on tolerance, dose and setting.`,
    });
  }

  if (s.flavors?.length || s.terpene) {
    faqs.push({
      question: `What does ${s.name} taste and smell like?`,
      answer: `${s.name} is commonly described as ${
        s.flavors?.length ? list(s.flavors) : "aromatic"
      }${s.terpene ? `, driven largely by its dominant terpene, ${s.terpene}` : ""}. Terpenes shape both the aroma and a good part of how the strain feels.`,
    });
  }

  if (s.medicalUses?.length) {
    faqs.push({
      question: `What is ${s.name} used for?`,
      answer: `Users commonly reach for ${s.name} for ${list(
        s.medicalUses,
      )}. This is general cannabis education, not medical advice — speak to a qualified healthcare professional about your own situation.`,
    });
  }

  if (s.negatives?.length) {
    faqs.push({
      question: `Are there any downsides to ${s.name}?`,
      answer: `The most commonly reported side effects are ${list(
        s.negatives,
      )}. Starting with a low dose and going slow is the simplest way to avoid most of them.`,
    });
  }

  faqs.push({
    question: `Where can I buy ${s.name} in South Africa?`,
    answer: `Availability of ${s.name} changes constantly between clubs and dispensaries. Ask Cuddles what's in stock near you and it will match ${s.name} — or the closest equivalent by effect and terpene profile — against live dispensary menus instead of a static list.`,
  });

  return faqs;
};

export const faqSchema = (faqs: StrainFaq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

export const breadcrumbSchema = (name: string, slug: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://cuddles-ai.com/" },
    { "@type": "ListItem", position: 2, name: "Cannabis Strains", item: "https://cuddles-ai.com/strains" },
    { "@type": "ListItem", position: 3, name, item: `https://cuddles-ai.com/strains/${slug}` },
  ],
});
