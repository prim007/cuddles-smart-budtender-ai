/**
 * Cuddles Plant Care Directory.
 * Mirrors the strain guide, but for everyday plants: houseplants, herbs,
 * vegetables and South African indigenous species. This same data is mirrored
 * into the Cuddles knowledge base (see supabase/functions/_shared/plant-corpus.ts)
 * so the chat answers from the exact guidance published here.
 */

export type PlantCategory =
  | "Houseplant"
  | "Herb"
  | "Vegetable"
  | "Indigenous (SA)"
  | "Succulent";

export interface PlantEntry {
  slug: string;
  name: string;
  botanicalName: string;
  category: PlantCategory;
  difficulty: "Easy" | "Moderate" | "Advanced";
  summary: string;
  light: string;
  water: string;
  soil: string;
  humidity: string;
  temperature: string;
  feeding: string;
  propagation: string;
  toxicity: string;
  commonProblems: { problem: string; cause: string; fix: string }[];
  tips: string[];
}

export const PLANT_GUIDE: PlantEntry[] = [
  {
    slug: "monstera-deliciosa",
    name: "Monstera Deliciosa",
    botanicalName: "Monstera deliciosa",
    category: "Houseplant",
    difficulty: "Easy",
    summary:
      "The split-leaf classic. Fast, forgiving and dramatic once it starts fenestrating — it just needs bright indirect light and a chunky, free-draining mix.",
    light: "Bright indirect light. Direct midday sun scorches leaves; deep shade stops fenestration.",
    water: "Water when the top 3-5 cm of mix is dry — roughly every 7-10 days in summer, every 2-3 weeks in winter.",
    soil: "Chunky aroid mix: 40% potting soil, 30% orchid bark, 20% perlite, 10% coco coir.",
    humidity: "Happy at 50-60% RH; higher humidity gives larger leaves and more splits.",
    temperature: "18-30°C. Keep above 12°C and away from cold draughts.",
    feeding: "Balanced liquid feed at half strength every 2-4 weeks in spring and summer; none in winter.",
    propagation: "Cut below a node with an aerial root, root in water for 3-4 weeks, then pot up.",
    toxicity: "Toxic to cats, dogs and children if chewed (calcium oxalate crystals).",
    commonProblems: [
      { problem: "No splits in leaves", cause: "Too little light, or plant still juvenile", fix: "Move closer to a bright window and give it a moss pole to climb." },
      { problem: "Yellow lower leaves", cause: "Overwatering or compacted soil", fix: "Let the mix dry further, check drainage, repot into a chunkier mix." },
      { problem: "Brown crispy edges", cause: "Low humidity or underwatering", fix: "Group plants together, raise humidity, water more consistently." },
    ],
    tips: [
      "Give it something to climb — vertical support triggers bigger, more split leaves.",
      "Wipe leaves monthly; dust cuts light absorption noticeably.",
    ],
  },
  {
    slug: "snake-plant",
    name: "Snake Plant",
    botanicalName: "Dracaena trifasciata",
    category: "Houseplant",
    difficulty: "Easy",
    summary:
      "Almost unkillable, thrives on neglect and tolerates low light. The only reliable way to kill it is watering too often.",
    light: "Anything from low light to bright indirect; grows fastest in bright light.",
    water: "Water only when the soil is fully dry — every 2-4 weeks in summer, every 6-8 weeks in winter.",
    soil: "Cactus/succulent mix or potting soil cut 50/50 with coarse sand or perlite.",
    humidity: "Indifferent — tolerates dry indoor air of 30-40% RH.",
    temperature: "15-30°C. Protect from frost.",
    feeding: "Light feed once or twice over the growing season; it stores its own reserves.",
    propagation: "Divide the rhizome, or root leaf cuttings in water (variegation is lost in leaf cuttings).",
    toxicity: "Mildly toxic to pets if eaten — causes nausea.",
    commonProblems: [
      { problem: "Mushy base, leaves falling over", cause: "Root rot from overwatering", fix: "Unpot, cut away rotted rhizome, repot dry, then water far less." },
      { problem: "Wrinkled, curling leaves", cause: "Underwatered for months", fix: "Soak thoroughly and resume a monthly rhythm." },
    ],
    tips: [
      "Terracotta pots dramatically reduce the risk of rot.",
      "Perfect first plant, and fine in a dim bedroom or office corner.",
    ],
  },
  {
    slug: "pothos",
    name: "Pothos (Devil's Ivy)",
    botanicalName: "Epipremnum aureum",
    category: "Houseplant",
    difficulty: "Easy",
    summary:
      "The best beginner trailing plant: grows quickly, tells you clearly when it's thirsty, and roots from cuttings in a glass of water.",
    light: "Low to bright indirect. Variegated forms need brighter light to keep their pattern.",
    water: "Water when the top 3 cm is dry; leaves droop slightly as a warning before real stress.",
    soil: "Standard potting mix with a handful of perlite.",
    humidity: "40-60% RH is plenty.",
    temperature: "18-29°C.",
    feeding: "Half-strength balanced feed monthly in spring and summer.",
    propagation: "Cut a vine below a node, root in water for 2-3 weeks, plant up in clusters.",
    toxicity: "Toxic to cats and dogs if chewed.",
    commonProblems: [
      { problem: "Long bare vines", cause: "Insufficient light", fix: "Move brighter and prune back hard — it branches from the cut." },
      { problem: "Black stems near soil", cause: "Root rot", fix: "Take healthy cuttings, restart, and discard the soggy root ball." },
    ],
    tips: [
      "Prune regularly for a full plant; every cutting becomes a new plant.",
      "Great on top of a shelf where the vines can trail down.",
    ],
  },
  {
    slug: "fiddle-leaf-fig",
    name: "Fiddle Leaf Fig",
    botanicalName: "Ficus lyrata",
    category: "Houseplant",
    difficulty: "Advanced",
    summary:
      "Stunning but opinionated. It wants consistency more than anything: one bright spot, one watering rhythm, no moving it around.",
    light: "Very bright indirect light, ideally a few hours of gentle direct morning sun.",
    water: "Deep water when the top 5 cm is dry, roughly weekly in summer; never let it sit in a saucer.",
    soil: "Well-draining potting mix with bark and perlite.",
    humidity: "Prefers 50-65% RH.",
    temperature: "18-27°C. Extremely sensitive to cold draughts and aircon.",
    feeding: "Nitrogen-forward feed every 3-4 weeks in the growing season.",
    propagation: "Stem cuttings with one or two leaves, rooted in water or moist perlite.",
    toxicity: "Sap irritates skin and is toxic to pets.",
    commonProblems: [
      { problem: "Brown spots in the leaf centre", cause: "Overwatering / root rot", fix: "Dry out, check drainage, reduce watering frequency." },
      { problem: "Brown crispy edges", cause: "Underwatering or dry air", fix: "Water more deeply and raise humidity." },
      { problem: "Sudden leaf drop", cause: "It was moved, or hit by a draught", fix: "Pick one location and leave it there." },
    ],
    tips: [
      "Rotate a quarter turn weekly for even growth.",
      "Notch or prune the top to force branching instead of a bare stick.",
    ],
  },
  {
    slug: "peace-lily",
    name: "Peace Lily",
    botanicalName: "Spathiphyllum wallisii",
    category: "Houseplant",
    difficulty: "Easy",
    summary:
      "Flowers indoors in modest light and visibly wilts when thirsty, which makes it a very honest plant to learn on.",
    light: "Medium to bright indirect; blooms need decent light, foliage survives shade.",
    water: "Keep lightly moist — water as soon as the leaves start to droop.",
    soil: "Rich, moisture-retentive potting mix.",
    humidity: "Loves 60%+ RH; a bathroom suits it well.",
    temperature: "18-27°C.",
    feeding: "Half-strength feed every 6 weeks in spring and summer.",
    propagation: "Division at repotting time.",
    toxicity: "Toxic to cats and dogs (calcium oxalate).",
    commonProblems: [
      { problem: "Brown leaf tips", cause: "Tap water salts or fluoride", fix: "Use filtered or rainwater and flush the pot every few months." },
      { problem: "No flowers", cause: "Too dark", fix: "Move to brighter indirect light and feed during spring." },
    ],
    tips: ["Never let it wilt repeatedly — each collapse costs it leaves."],
  },
  {
    slug: "zz-plant",
    name: "ZZ Plant",
    botanicalName: "Zamioculcas zamiifolia",
    category: "Houseplant",
    difficulty: "Easy",
    summary:
      "Glossy, architectural and built for neglect — its rhizomes store water, so months between drinks are fine.",
    light: "Low to bright indirect. Avoid harsh direct sun.",
    water: "Every 3-6 weeks; always let the mix dry out completely.",
    soil: "Free-draining mix with plenty of perlite or sand.",
    humidity: "Tolerates dry air.",
    temperature: "16-30°C.",
    feeding: "Twice a year at half strength is enough.",
    propagation: "Rhizome division, or leaf cuttings (slow — several months).",
    toxicity: "Toxic if ingested; sap can irritate skin.",
    commonProblems: [
      { problem: "Yellowing stalks", cause: "Overwatering", fix: "Stop watering, check the rhizomes for softness, repot if mushy." },
    ],
    tips: ["The single most forgiving plant for a dim office."],
  },
  {
    slug: "basil",
    name: "Basil",
    botanicalName: "Ocimum basilicum",
    category: "Herb",
    difficulty: "Easy",
    summary:
      "Fast, generous and heat-loving. Pinch it constantly and it doubles; let it flower and it stops producing leaves.",
    light: "6+ hours of direct sun, or a very bright windowsill.",
    water: "Keep evenly moist — daily in hot weather. It wilts fast and recovers fast.",
    soil: "Rich, well-draining potting soil with compost.",
    humidity: "Average; avoid wetting the leaves at night.",
    temperature: "20-30°C. Frost kills it outright.",
    feeding: "Diluted balanced feed every 2 weeks.",
    propagation: "Seed, or root 10 cm cuttings in water in about a week.",
    toxicity: "Edible and pet-safe.",
    commonProblems: [
      { problem: "Leggy stems, few leaves", cause: "Not pinched, or too little sun", fix: "Pinch above a leaf pair every 2 weeks and move into full sun." },
      { problem: "Black spots and mildew", cause: "Wet leaves and poor airflow", fix: "Water at soil level in the morning and thin out crowded stems." },
    ],
    tips: ["Remove flower spikes the moment you see them to keep the harvest going."],
  },
  {
    slug: "mint",
    name: "Mint",
    botanicalName: "Mentha spicata",
    category: "Herb",
    difficulty: "Easy",
    summary:
      "Vigorous to the point of invasive. Grow it in its own pot unless you want it to own the whole bed.",
    light: "Partial sun to full sun; tolerates a half-day of shade.",
    water: "Keep consistently moist — it hates drying out.",
    soil: "Any decent potting mix; not fussy.",
    humidity: "Average.",
    temperature: "15-28°C; roots survive light frost and reshoot.",
    feeding: "Light feed monthly; too much nitrogen dilutes the flavour.",
    propagation: "Runners or water-rooted cuttings — almost automatic.",
    toxicity: "Edible; safe around pets.",
    commonProblems: [
      { problem: "Rust-coloured pustules under leaves", cause: "Mint rust fungus", fix: "Cut back to the ground, bin the clippings, improve airflow." },
    ],
    tips: ["Always container-grow it, even in a garden bed — sink the pot into the soil."],
  },
  {
    slug: "rosemary",
    name: "Rosemary",
    botanicalName: "Salvia rosmarinus",
    category: "Herb",
    difficulty: "Moderate",
    summary:
      "A Mediterranean shrub that wants sun, sharp drainage and to be left alone. Overwatering is the usual cause of death.",
    light: "Full sun, 6-8 hours.",
    water: "Only when the top 5 cm is dry; drought-tolerant once established.",
    soil: "Gritty, alkaline, sharply drained — add sand or grit.",
    humidity: "Prefers dry air and good airflow.",
    temperature: "10-30°C; tolerates light frost.",
    feeding: "Very little; a spring feed is plenty.",
    propagation: "Semi-hardwood cuttings in gritty mix.",
    toxicity: "Edible; safe in normal culinary amounts.",
    commonProblems: [
      { problem: "Grey, dying interior", cause: "Poor airflow or root rot", fix: "Prune to open the plant, repot into grittier mix, water less." },
    ],
    tips: ["Prune after flowering to keep it bushy, but never cut into bare old wood."],
  },
  {
    slug: "tomato",
    name: "Tomato",
    botanicalName: "Solanum lycopersicum",
    category: "Vegetable",
    difficulty: "Moderate",
    summary:
      "The highest-reward home crop. Sun, steady water and potassium at flowering are the three things that decide your harvest.",
    light: "Full sun, minimum 6-8 hours.",
    water: "Deep, regular watering at the base. Irregular watering causes splitting and blossom-end rot.",
    soil: "Rich compost-heavy soil, pH 6.0-6.8, deeply dug.",
    humidity: "Moderate; high humidity encourages blight.",
    temperature: "18-29°C. Fruit set fails above 35°C or below 13°C.",
    feeding: "Nitrogen while young, then switch to a high-potassium tomato feed weekly once flowering starts.",
    propagation: "Seed indoors 6-8 weeks before last frost; side-shoots root readily.",
    toxicity: "Fruit edible; leaves and stems are toxic.",
    commonProblems: [
      { problem: "Black sunken base on fruit", cause: "Blossom-end rot from calcium uptake failure (usually erratic watering)", fix: "Water consistently and mulch; add lime if soil tests low in calcium." },
      { problem: "Leaves curl upward", cause: "Heat stress or overwatering", fix: "Shade during peak heat and check drainage." },
      { problem: "Brown concentric spots on lower leaves", cause: "Early blight", fix: "Remove affected leaves, mulch to stop soil splash, improve airflow." },
    ],
    tips: [
      "Pinch side-shoots on indeterminate varieties to focus energy on fruit.",
      "Mulch heavily — it stabilises soil moisture and prevents most disease.",
    ],
  },
  {
    slug: "spinach",
    name: "Spinach",
    botanicalName: "Spinacia oleracea",
    category: "Vegetable",
    difficulty: "Easy",
    summary:
      "A quick cool-season crop, ready in 6 weeks. Its enemy is heat, which makes it bolt and turn bitter.",
    light: "Full sun in cool months; partial shade once it warms up.",
    water: "Consistent moisture; never let it dry out fully.",
    soil: "Fertile, nitrogen-rich, well-drained soil, pH 6.5-7.0.",
    humidity: "Average.",
    temperature: "10-22°C. Bolts above 24°C.",
    feeding: "Nitrogen-forward feed every 3 weeks.",
    propagation: "Direct-sow every 2-3 weeks for a continuous supply.",
    toxicity: "Edible.",
    commonProblems: [
      { problem: "Bolting to seed early", cause: "Heat and long days", fix: "Sow in autumn and late winter, and pick a bolt-resistant variety." },
      { problem: "Pale yellow leaves", cause: "Nitrogen shortage", fix: "Feed with a nitrogen-rich liquid fertiliser." },
    ],
    tips: ["Harvest outer leaves and the plant keeps producing for weeks."],
  },
  {
    slug: "chilli-pepper",
    name: "Chilli Pepper",
    botanicalName: "Capsicum annuum",
    category: "Vegetable",
    difficulty: "Moderate",
    summary:
      "Loves heat and hates wet feet. A mild dry spell before harvest concentrates the capsaicin and the heat.",
    light: "Full sun, 8 hours ideal.",
    water: "Moderate — let the top 3 cm dry between waterings.",
    soil: "Well-drained loam with compost, pH 6.0-6.8.",
    humidity: "Moderate.",
    temperature: "21-32°C; germination needs soil above 21°C.",
    feeding: "Balanced feed early, then high-potassium once flowering.",
    propagation: "Seed started warm indoors.",
    toxicity: "Edible; irritating to pets' mouths.",
    commonProblems: [
      { problem: "Flowers drop without fruit", cause: "Heat above 35°C, or too much nitrogen", fix: "Shade in peak heat and switch to a potassium feed." },
      { problem: "Curled sticky leaves", cause: "Aphids", fix: "Spray with soapy water or neem and encourage ladybirds." },
    ],
    tips: ["Slight water stress in the final weeks makes the fruit noticeably hotter."],
  },
  {
    slug: "spekboom",
    name: "Spekboom",
    botanicalName: "Portulacaria afra",
    category: "Indigenous (SA)",
    difficulty: "Easy",
    summary:
      "South Africa's carbon-sponge succulent: edible, drought-proof, and it roots from a snapped-off branch pushed into the ground.",
    light: "Full sun to bright partial shade.",
    water: "Deep watering every 2-3 weeks in summer, almost none in winter.",
    soil: "Sandy, gritty, sharply drained.",
    humidity: "Dry air is fine.",
    temperature: "5-40°C; protect from hard frost.",
    feeding: "Optional — a light feed once in spring.",
    propagation: "Break off a branch, let it callus for a day, push into soil. Done.",
    toxicity: "Edible (tart, lemony) and safe for pets and tortoises.",
    commonProblems: [
      { problem: "Soft, dropping leaves", cause: "Overwatering", fix: "Stop watering for a month and improve drainage." },
    ],
    tips: ["Superb hedge and erosion control plant for water-scarce South African gardens."],
  },
  {
    slug: "aloe-vera",
    name: "Aloe Vera",
    botanicalName: "Aloe barbadensis miller",
    category: "Succulent",
    difficulty: "Easy",
    summary:
      "A medicinal succulent that stores water in its leaves. Bright light plus dry soil equals a thriving plant.",
    light: "Bright light, including some direct sun. Acclimatise slowly to full sun.",
    water: "Soak thoroughly, then let it dry completely — every 3-4 weeks.",
    soil: "Cactus mix or potting soil with 50% grit.",
    humidity: "Dry air preferred.",
    temperature: "13-30°C; frost-sensitive.",
    feeding: "Half-strength succulent feed once or twice in summer.",
    propagation: "Remove and pot up the offsets ('pups') at the base.",
    toxicity: "Gel is used topically; the latex layer is a laxative and toxic to pets.",
    commonProblems: [
      { problem: "Flat, spreading, pale leaves", cause: "Not enough light", fix: "Move to a sunnier position gradually." },
      { problem: "Brown mushy leaf bases", cause: "Rot", fix: "Repot dry in gritty mix, remove affected leaves." },
    ],
    tips: ["Terracotta plus gritty mix is close to foolproof."],
  },
  {
    slug: "clivia",
    name: "Clivia",
    botanicalName: "Clivia miniata",
    category: "Indigenous (SA)",
    difficulty: "Easy",
    summary:
      "A shade-loving South African forest bulb with orange trumpet flowers — the classic plant for a dry, dim spot under trees.",
    light: "Deep to dappled shade. Direct sun burns the strap leaves.",
    water: "Moderate in summer; keep almost dry for 6-8 weeks in winter to trigger flowering.",
    soil: "Rich, well-drained, leafy compost mix.",
    humidity: "Average.",
    temperature: "10-27°C; a cool dry winter rest is essential for blooms.",
    feeding: "Feed monthly in summer, stop in autumn.",
    propagation: "Division of clumps after flowering, or slow-growing seed.",
    toxicity: "Toxic to pets if eaten.",
    commonProblems: [
      { problem: "No flowers", cause: "No cool, dry winter rest", fix: "Withhold water and keep it cool from May to July." },
      { problem: "Chewed, ragged leaves", cause: "Amaryllis caterpillar/lily borer", fix: "Remove by hand and treat early." },
    ],
    tips: ["Keeps flowering better when slightly pot-bound — don't rush to repot."],
  },
  {
    slug: "cannabis",
    name: "Cannabis",
    botanicalName: "Cannabis sativa L.",
    category: "Indigenous (SA)",
    difficulty: "Moderate",
    summary:
      "Cuddles' specialist crop. Grown legally at home in South Africa for private personal use, it needs stage-specific climate control more than anything else.",
    light: "18/6 light during vegetative growth, 12/12 to trigger flowering. Outdoors, full sun.",
    water: "Water when the top 3-5 cm is dry; aim for 10-20% runoff to avoid salt buildup.",
    soil: "Living soil or coco with perlite. pH 6.2-6.8 in soil, 5.8-6.2 in hydro/coco.",
    humidity: "Seedling 65-70%, veg 55-65%, flower 40-50% dropping to 40% late. Above 55% in late flower invites botrytis.",
    temperature: "Seedling 22-26°C, veg 22-28°C, flower 20-26°C day with cooler nights.",
    feeding: "Nitrogen-forward in veg; phosphorus/potassium-forward in flower. Flush if tips burn.",
    propagation: "Seed, or clones from a healthy mother rooted under a dome in 10-14 days.",
    toxicity: "Adults only — 18+ in South Africa. Keep away from children and pets.",
    commonProblems: [
      { problem: "Yellowing from the bottom up", cause: "Nitrogen deficiency", fix: "Feed nitrogen; check runoff pH first, since lockout mimics deficiency." },
      { problem: "Burnt leaf tips", cause: "Nutrient burn / high EC", fix: "Flush with pH-corrected water and reduce feed strength." },
      { problem: "Speckled leaves with fine webbing", cause: "Spider mites", fix: "Treat early with neem or predatory mites — never spray in late flower." },
    ],
    tips: [
      "Judge harvest with a 60x loupe: mostly cloudy with 5-15% amber for peak potency.",
      "Dry at 18-20°C and 55-62% RH for 7-14 days, then cure in jars at 58-62% RH.",
      "Education only, not medical or legal advice.",
    ],
  },
  {
    slug: "lavender",
    name: "Lavender",
    botanicalName: "Lavandula angustifolia",
    category: "Herb",
    difficulty: "Moderate",
    summary:
      "Sun, grit and restraint. Lavender dies from kindness — rich soil and frequent water rot it fast.",
    light: "Full sun, all day.",
    water: "Deep but infrequent; drought-tolerant once established.",
    soil: "Poor, gritty, alkaline and sharply drained.",
    humidity: "Prefers dry air and open airflow.",
    temperature: "5-30°C; many varieties are frost-hardy.",
    feeding: "None needed; feeding reduces oil and flowering.",
    propagation: "Semi-hardwood cuttings in late summer.",
    toxicity: "Safe for people; mildly toxic to pets in quantity.",
    commonProblems: [
      { problem: "Woody, sprawling centre", cause: "Never pruned", fix: "Trim by a third after flowering each year, staying in green growth." },
    ],
    tips: ["Its linalool is the same calming terpene found in some cannabis cultivars."],
  },
  {
    slug: "string-of-pearls",
    name: "String of Pearls",
    botanicalName: "Curio rowleyanus",
    category: "Succulent",
    difficulty: "Moderate",
    summary:
      "A beautiful trailing succulent with shallow roots — the trick is bright light and letting it dry out fully between drinks.",
    light: "Bright indirect light with a little gentle direct sun.",
    water: "Every 2-3 weeks; pearls shrivel slightly when thirsty.",
    soil: "Succulent mix in a shallow pot.",
    humidity: "Dry air is fine.",
    temperature: "18-26°C.",
    feeding: "Half-strength feed twice in summer.",
    propagation: "Lay strands on soil; they root from the nodes.",
    toxicity: "Toxic to pets if eaten.",
    commonProblems: [
      { problem: "Mushy, bursting pearls", cause: "Overwatering", fix: "Dry out completely, repot into a shallower, grittier pot." },
      { problem: "Bald upper strands", cause: "Too little light", fix: "Move brighter and tuck strands back over the soil to reroot." },
    ],
    tips: ["Shallow pots suit its shallow root system far better than deep ones."],
  },
];

export const PLANT_CATEGORIES: PlantCategory[] = [
  "Houseplant",
  "Herb",
  "Vegetable",
  "Indigenous (SA)",
  "Succulent",
];

export const getPlant = (slug: string) =>
  PLANT_GUIDE.find((p) => p.slug === slug);
