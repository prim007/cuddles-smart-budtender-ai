// Curated Cuddles knowledge corpus.
// These are the authoritative, human-curated notes that back Cuddles' answers.
// They are embedded into public.knowledge_documents and retrieved per question
// (RAG), on top of the static knowledge baked into the system prompt.

export type KnowledgeDoc = {
  category: "strain" | "dosing" | "safety" | "terpene" | "cultivation" | "legal";
  title: string;
  content: string;
  tags: string[];
  source?: string;
};

export const KNOWLEDGE_CORPUS: KnowledgeDoc[] = [
  // ── Chemotype / strain matching ────────────────────────────────────────────
  {
    category: "strain",
    title: "Chemotype classes replace indica vs sativa",
    tags: ["chemotype", "indica", "sativa", "thc", "cbd"],
    content:
      "Effect is predicted by chemotype and terpene profile, not by the indica/sativa label (which is horticultural shorthand). Type I = THC-dominant (>0.3% THC, low CBD) — psychoactive, best for appetite, acute pain, euphoria. Type II = balanced THC:CBD (roughly 1:1 to 1:2) — reduced intoxication, better tolerated for anxiety and inflammation. Type III = CBD-dominant (<0.3% THC) — non-intoxicating, used for daytime calm and seizure-adjacent research contexts. When matching a user request, first pick the chemotype class, then the terpene lead, then the potency ceiling.",
  },
  {
    category: "strain",
    title: "Anxiety-prone user: chemotype target",
    tags: ["anxiety", "paranoia", "beginner", "type ii"],
    content:
      "For users who report paranoia or anxiety from cannabis, target Type II (balanced THC:CBD) or Type III with THC kept under ~15%. Prefer limonene- or linalool-led profiles; avoid high-THC pinene-poor profiles above 22%. CBD attenuates THC-driven anxiety at ratios of at least 1:1. Advise a single small inhalation, wait 15 minutes, and reassess before redosing. General education, not medical advice.",
  },
  {
    category: "strain",
    title: "Sleep request: chemotype target",
    tags: ["sleep", "insomnia", "myrcene", "cbn"],
    content:
      "For sleep, target myrcene-dominant Type I or Type II profiles, often with linalool or humulene support, and consider CBN-containing aged or formulated products. Note honestly that CBN's sedative effect is weaker than marketing implies; myrcene load and total dose matter more. Edibles (5-10 mg THC) suit sleep-maintenance issues because of the 4-8 hour duration; inhalation suits sleep-onset issues because of the fast 5-10 minute onset.",
  },
  {
    category: "strain",
    title: "Focus and daytime function: chemotype target",
    tags: ["focus", "energy", "daytime", "pinene", "terpinolene"],
    content:
      "For focus or daytime energy, target moderate-THC (12-18%) profiles led by pinene, terpinolene, or limonene, with low myrcene. Pinene is associated with reduced short-term memory disruption; terpinolene tracks with 'uplifting' user reports. Keep the dose to one or two inhalations — the dose-response for focus is an inverted U, and more THC reliably degrades working memory.",
  },
  {
    category: "strain",
    title: "Social and creative sessions: chemotype target",
    tags: ["social", "creative", "euphoria", "limonene"],
    content:
      "For social or creative use, target limonene-led Type I in the 15-20% THC band, or Type II if the user is anxiety-prone. Caryophyllene support smooths the body feel. Recommend a set dose ceiling before the session starts, spacing of 20+ minutes between doses, and no mixing with alcohol, which multiplies THC blood levels and dizziness.",
  },
  {
    category: "strain",
    title: "Pain requests: chemotype target",
    tags: ["pain", "inflammation", "caryophyllene", "type ii"],
    content:
      "For chronic pain, the strongest evidence supports Type II balanced products; caryophyllene is a CB2 agonist tied to anti-inflammatory effects, and myrcene contributes muscle relaxation. Inhalation gives fast breakthrough relief; oral/tincture gives longer baseline coverage. Escalate the dose slowly across days, not within one session. This is general education — chronic pain should be managed with a clinician.",
  },

  // ── Terpenes ───────────────────────────────────────────────────────────────
  {
    category: "terpene",
    title: "Core terpene reference",
    tags: ["terpene", "myrcene", "limonene", "pinene", "linalool", "caryophyllene"],
    content:
      "Myrcene (herbal, mango): sedating at higher loads, muscle-relaxing, most common terpene in commercial cannabis. Limonene (citrus): mood-lifting, anxiolytic in animal models. Pinene (pine): alertness, bronchodilation, may blunt THC memory impairment. Linalool (floral, lavender): calming, anxiolytic. Beta-caryophyllene (pepper): the only common terpene that binds CB2 directly — anti-inflammatory. Terpinolene (fresh, floral): uplifting, common in 'sativa-labelled' cultivars. Humulene (hops): appetite-suppressing in animal data. Terpenes degrade above ~157°C, which is why low-temp vaping preserves flavor and nuance.",
  },

  // ── Dosing ─────────────────────────────────────────────────────────────────
  {
    category: "dosing",
    title: "Edible dosing ladder",
    tags: ["dosing", "edibles", "beginner", "mg"],
    content:
      "Edible THC: microdose 1-2.5 mg (minimal intoxication), low 2.5-5 mg (typical new-user start), moderate 5-10 mg (experienced), high 10-20 mg+ (high tolerance only). Onset 30-120 minutes, peak 2-4 hours, total duration 4-8 hours and sometimes 12. The number one edible mistake is redosing before 2 hours. Liver conversion to 11-hydroxy-THC makes edibles feel stronger and longer than inhalation at the same mg. Start low, go slow, wait a full 2 hours.",
  },
  {
    category: "dosing",
    title: "Inhalation dosing guidance",
    tags: ["dosing", "vape", "smoke", "titration"],
    content:
      "Inhaled THC: onset 0-10 minutes, peak 10-30 minutes, duration 2-4 hours. Titration rule: one inhalation, wait 10-15 minutes, reassess. A typical 0.3 g joint at 20% THC contains ~60 mg THC, of which roughly 10-35% is absorbed. Vaporizing at 175-190°C favors clarity and terpene retention; 200-210°C extracts more cannabinoids with a heavier body effect. Concentrates (60-90% THC) should not be a beginner's first format.",
  },
  {
    category: "dosing",
    title: "CBD and balanced product dosing",
    tags: ["dosing", "cbd", "tincture"],
    content:
      "CBD is commonly used at 10-25 mg for general calm, 25-50 mg for more pronounced effects, and higher clinical doses exist but belong under medical supervision. Sublingual tinctures held 60-90 seconds under the tongue onset in 15-45 minutes. CBD inhibits CYP3A4/CYP2C19 at higher doses, so anyone on prescription medication — especially blood thinners, anti-seizure drugs, or immunosuppressants — should check with a pharmacist first.",
  },
  {
    category: "dosing",
    title: "Tolerance and tolerance breaks",
    tags: ["tolerance", "t-break", "cb1"],
    content:
      "Daily THC use downregulates CB1 receptors within days to weeks. CB1 density begins recovering within about 48 hours of abstinence and largely normalizes by around 4 weeks. A 7-day break already restores a noticeable share of sensitivity. Practical tapering: cut dose by half for 2-3 days, then stop; expect vivid dreams, appetite dip, irritability and sleep disruption for the first 3-5 days, peaking around day 2-3.",
  },

  // ── Safety ─────────────────────────────────────────────────────────────────
  {
    category: "safety",
    title: "Overconsumption ('greening out') response",
    tags: ["safety", "overconsumption", "panic", "cbd"],
    content:
      "Too much THC causes anxiety, racing heart, nausea, sweating and paranoia. It is intensely unpleasant but not lethal. Response: move to a calm quiet space, sit or lie down, slow breathing (4 in, 6 out), sip water, eat something light, and wait — inhaled effects fade in 2-4 hours, edibles in 4-12. CBD may blunt the peak. Black pepper (chewed peppercorns, caryophyllene) is a widely reported folk remedy. Seek emergency care for chest pain, fainting, persistent vomiting, or psychosis-like symptoms that do not resolve.",
  },
  {
    category: "safety",
    title: "Who should avoid or be cautious with THC",
    tags: ["safety", "contraindication", "pregnancy", "psychosis", "cardiac"],
    content:
      "Advise against THC use in pregnancy and breastfeeding, in adolescents (ongoing brain development), and in people with a personal or family history of schizophrenia or psychosis. Extra caution with unstable cardiovascular disease (THC raises heart rate 20-50 bpm for up to 3 hours), with alcohol or sedatives, and before driving — impairment lasts 3-6 hours inhaled and up to 12 hours for edibles. Never advise on stopping prescribed medication; refer to a clinician.",
  },
  {
    category: "safety",
    title: "Drug interaction cautions",
    tags: ["safety", "interactions", "cyp450", "warfarin"],
    content:
      "Cannabinoids are metabolized by CYP3A4 and CYP2C9; CBD inhibits CYP3A4, CYP2C19 and CYP2D6. Meaningful interaction risk exists with warfarin (raised INR), clobazam, valproate, some SSRIs, tacrolimus and other narrow-therapeutic-index drugs. The correct answer to any interaction question is a caution plus 'confirm with your pharmacist or prescriber' — never a dosing instruction.",
  },
  {
    category: "safety",
    title: "Product safety and contaminants",
    tags: ["safety", "testing", "coa", "vape"],
    content:
      "Prefer products with a batch Certificate of Analysis covering cannabinoid potency, pesticides, heavy metals, residual solvents and microbials. Avoid unregulated vape carts containing vitamin E acetate (linked to EVALI), and never attempt butane extraction at home. Store cannabis in an airtight container away from light and heat; potency and terpenes degrade with UV, oxygen and temperature.",
  },
  {
    category: "safety",
    title: "Standing disclaimer language",
    tags: ["safety", "disclaimer", "compliance"],
    content:
      "Every health, dosing, or symptom-related answer must end with a clear line that this is general education and not medical advice, and that users should consult a qualified healthcare professional for their situation. Cuddles never diagnoses, never prescribes, never advises on stopping medication, and never gives legal advice on obtaining cannabis where it is illegal.",
  },

  // ── Cultivation ────────────────────────────────────────────────────────────
  {
    category: "cultivation",
    title: "Grow environment targets by stage",
    tags: ["grow", "vpd", "humidity", "temperature"],
    content:
      "Seedling: 22-26°C, 65-70% RH, 18/6 light, very light feeding. Vegetative: 22-28°C, 55-65% RH, 18/6, nitrogen-forward feed, pH 5.8-6.2 in hydro or 6.2-6.8 in soil. Flower: 20-26°C day / a few degrees cooler at night, 40-50% RH dropping to 40% late, 12/12 light, phosphorus/potassium-forward. Late flower above 55% RH invites botrytis. Target VPD roughly 0.8-1.2 kPa in veg and 1.2-1.6 kPa in flower.",
  },
  {
    category: "cultivation",
    title: "Deficiency and problem triage",
    tags: ["grow", "deficiency", "nitrogen", "pests"],
    content:
      "Yellowing from the bottom up with even fade = nitrogen deficiency. Interveinal yellowing on older leaves = magnesium. Rusty brown spots = calcium. Clawed dark green leaves = nitrogen toxicity. Burnt leaf tips = nutrient burn, flush and reduce EC. Most 'deficiencies' in soil are actually pH lockout — check runoff pH before adding nutrients. Speckled leaves plus fine webbing = spider mites; treat early with neem or predatory mites, never in late flower.",
  },
  {
    category: "cultivation",
    title: "Harvest timing and cure",
    tags: ["grow", "harvest", "trichome", "cure"],
    content:
      "Judge harvest by trichomes under 60x magnification: mostly cloudy with 5-15% amber gives peak potency with clarity; 20-30% amber gives a heavier sedating profile. Dry at 18-20°C and 55-62% RH for 7-14 days until small stems snap. Cure in sealed jars at 58-62% RH, burping daily for the first week, then weekly; two to four weeks of cure materially improves smoothness and aroma.",
  },
  {
    category: "cultivation",
    title: "General houseplant care principles",
    tags: ["plants", "houseplant", "watering", "light"],
    content:
      "Cuddles is a plant expert first. Most houseplant deaths are overwatering: water only when the top 2-5 cm of medium is dry, and always use drainage. Light rules of thumb: bright indirect = within 1-2 m of an east/north window (southern hemisphere), low light tolerates 3+ m or filtered. Yellow lower leaves with soggy soil = root rot; crispy brown edges = low humidity or underwatering. Feed at half strength during active growth, not in dormancy.",
  },

  // ── Legal / market ─────────────────────────────────────────────────────────
  {
    category: "legal",
    title: "South Africa legal position",
    tags: ["legal", "south africa", "popia", "cannabis act"],
    content:
      "In South Africa, private adult use and cultivation for personal consumption are lawful following the 2018 Constitutional Court ruling and the Cannabis for Private Purposes Act. Commercial sale to the public remains restricted, and hemp/medical cannabis operate under SAHPRA licensing. Cuddles gives education about the framework but never advises on circumventing the law and never confirms the legality of a specific transaction — that requires a legal professional.",
  },
  {
    category: "legal",
    title: "Answering purchase-intent questions",
    tags: ["commerce", "dispensary", "intent"],
    content:
      "When a user's question is commercial ('where can I buy X', 'who has X in stock near me'), Cuddles switches from education to sourcing: it checks connected dispensary inventory first, then offers nearby licensed dispensary discovery. When a user asks for advice ('what helps me sleep'), Cuddles answers with the strain matching protocol and does not hijack the conversation into a location prompt.",
  },
];

export const CORPUS_VERSION = "2026-08-05";
