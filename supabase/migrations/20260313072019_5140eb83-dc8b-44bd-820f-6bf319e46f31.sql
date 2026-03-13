-- Ensure Ghana article exists in both preview and published environments
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  author,
  tags,
  published,
  published_at,
  featured_image
)
SELECT
  'Ghana Launches Regulated Medicinal Cannabis Program: What You Need to Know',
  'ghana-medicinal-cannabis-regulation-2026',
  'Ghana has officially launched its Medicinal Cannabis Regulatory Program, becoming one of the latest African nations to create a legal framework for medicinal and industrial cannabis — while keeping recreational use firmly illegal.',
  $$## Ghana Takes a Historic Step on Cannabis Regulation

In February 2026, Ghana officially launched its **Medicinal Cannabis Regulatory Program**, a landmark move that positions the West African nation as a growing player in the global medicinal cannabis industry. The program, spearheaded by the Ministry of the Interior and the Narcotics Control Commission (NACOC), establishes a strict licensing regime for medicinal and industrial cannabis — while making it crystal clear that recreational use remains illegal.

**"Dealing in weed is still illegal,"** declared Interior Minister Mohammed Muntaka Mubarak at the official launch in Accra.

---

## The Legal Framework

The program is built on a robust legal foundation:

- **Narcotics Control Commission Act, 2020 (Act 1019)** — established NACOC and the legal framework for controlling narcotic drugs
- **Narcotics Control Commission (Amendment) Act, 2023 (Act 1100)** — amended Section 43 to authorize cannabis licensing
- **Narcotics Control Commission Regulations, 2023 (LI 2475)** — detailed regulations for cultivation, processing, transport, import, export, and related activities

Under LI 2475, only cannabis with a **THC content not exceeding 0.3%** on a dry weight basis — classified as therapeutic or industrial hemp — is permitted. High-THC cannabis associated with recreational use remains strictly prohibited.

---

## 11 Categories of Licenses

Dr. Pharmba Basha Ligbi, Head of the Cannabis Regulation Department at NACOC, outlined the available license categories:

1. Breeding
2. Cultivation
3. Processing
4. Research and Development
5. Storage
6. Transport
7. Import
8. Export
9. Sales and Distribution
10. Advertisement and Promotion
11. General operations

### Who Can Apply?

- Applicants must be **at least 18 years old**
- Must be **Ghanaian citizens or legal residents**
- Corporate bodies must have **at least 50% Ghanaian shareholding** or a majority Ghanaian board
- The application process is **fully digitized**
- Payments are made **only upon approval**
- Licenses are valid for **three years**, subject to renewal

---

## Strict Enforcement and Technology

The government is taking compliance seriously:

- **Drone surveillance** to monitor cannabis farms
- **QR-coded identification cards** for all license holders
- **Specialized software** for tracking and enforcement
- **Unannounced inspections** authorized for NACOC inspectors
- Cultivation is **prohibited near schools, recreational centers, and residential areas**

A multi-agency approach involves the Police, Immigration, Prisons, Fire Service, and National Intelligence Bureau.

*"If we joke and get it wrong, Ghana could be blacklisted, and all the effort will come to nothing,"* warned Minister Mubarak.

---

## Economic Potential

The regulated cannabis industry is expected to:

- **Attract local and foreign investment**
- **Create jobs**, particularly in rural communities
- **Generate revenue** through licensing fees and exports
- Enable **farmer cooperatives** to transition smallholder farmers from illegal cultivation to regulated production

---

## What This Means for the Cannabis Industry

Ghana joins a growing list of African nations — including South Africa, Lesotho, Malawi, and Zimbabwe — that have established legal frameworks for medicinal cannabis. The move signals Africa's increasing role in the global cannabis supply chain, particularly for CBD-dominant products.

For the international cannabis community, Ghana's program represents:

- A new market opportunity in West Africa
- Strict but clear regulatory pathways for investors
- A model for balancing economic development with public health safeguards

---

## Key Takeaway

Ghana is **not legalizing recreational cannabis**. This program is narrowly focused on medicinal and industrial applications with stringent oversight. As Minister Mubarak put it:

*"This is about job creation, medicine and revenue — not about recreational use of drugs. Ghana is not legalizing weed."*

---

### Sources

1. Ghana News Agency — [Government launches regulated medicinal cannabis regime](https://gna.org.gh/2026/02/government-launches-regulated-medicinal-cannabis-regime/) (February 27, 2026)
2. BusinessGhana — [Ghana launches Medicinal Cannabis Regulatory Program under strict legal framework](https://www.businessghana.com/site/news/general/344263/Medicinal-Cannabis-Regulatory-Program-Launch) (March 1, 2026)
3. BBC News Pidgin — [Ghana officially begin to give license for industrial and medicinal cultivation of cannabis](https://www.bbc.com/pidgin/articles/cx2rxwlrjp8o) (February 26, 2026)$$,
  'Cuddles Editorial',
  ARRAY['cannabis legislation', 'Ghana', 'Africa', 'medicinal cannabis', 'regulation'],
  true,
  '2026-03-12 10:00:00+00',
  'https://cuddles-ai.com/images/blog/ghana-cannabis-regulation.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM public.blog_posts WHERE slug = 'ghana-medicinal-cannabis-regulation-2026'
);

-- Keep existing row aligned if it already exists
UPDATE public.blog_posts
SET
  title = 'Ghana Launches Regulated Medicinal Cannabis Program: What You Need to Know',
  excerpt = 'Ghana has officially launched its Medicinal Cannabis Regulatory Program, becoming one of the latest African nations to create a legal framework for medicinal and industrial cannabis — while keeping recreational use firmly illegal.',
  author = 'Cuddles Editorial',
  tags = ARRAY['cannabis legislation', 'Ghana', 'Africa', 'medicinal cannabis', 'regulation'],
  published = true,
  published_at = '2026-03-12 10:00:00+00',
  featured_image = 'https://cuddles-ai.com/images/blog/ghana-cannabis-regulation.jpg',
  updated_at = now()
WHERE slug = 'ghana-medicinal-cannabis-regulation-2026';