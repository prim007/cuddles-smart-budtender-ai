// Dispensary menus shown inline in the chat.
// Add a new partner by pushing to DISPENSARY_MENUS.
// Prices are in ZAR unless the entry says otherwise.
import leflabsCatalogue from "@/assets/leflabs-catalogue.pdf.asset.json";



export interface MenuItem {
  name: string;
  category?: string;   // e.g. "Flower", "Edibles", "Concentrates"
  size?: string;       // e.g. "1g", "3.5g", "100mg"
  price?: number;      // numeric price (omitted when pricing is on request)
  notes?: string;      // optional short note (THC%, effect)
}

export interface DispensaryMenu {
  id: string;
  label: string;
  currency: string;         // "R", "$", etc
  aliases: string[];        // lowercase name variants (without "menu")
  contact?: string;         // phone / WhatsApp
  disclaimer?: string;
  /** Tel number the "Order now" button dials (digits only, no spaces). */
  orderPhone?: string;
  /** Embedded catalogue PDF shown inline in chat. */
  pdfUrl?: string;
  /** Hide numeric prices (e.g. confidential wholesale pricing). */
  hidePrices?: boolean;
  /** Shown in place of prices when hidePrices is on. */
  priceNote?: string;
  items: MenuItem[];
}


export const DISPENSARY_MENUS: DispensaryMenu[] = [
  {
    id: "tripple444",
    label: "Tripple444 Shop Menu",
    currency: "R",
    aliases: ["tripple444", "tripple 444", "triple444", "triple 444", "tripple four", "triple four"],
    contact: "WhatsApp 064 543 6734 · tripplefourshophub.online",
    disclaimer: "Prices in ZAR. Delivery calculated at checkout. Not medical advice.",
    items: [
      { category: "Flower", name: "Runtz",             size: "1g",   price: 180, notes: "Hybrid · sweet" },
      { category: "Flower", name: "Gelato",            size: "1g",   price: 180, notes: "Hybrid · relaxing" },
      { category: "Flower", name: "Zkittlez",          size: "1g",   price: 170, notes: "Indica · calm" },
      { category: "Flower", name: "Durban Poison",     size: "1g",   price: 150, notes: "Sativa · uplifting" },
      { category: "Flower", name: "OG Kush",           size: "3.5g", price: 550, notes: "Hybrid · classic" },
      { category: "Pre-Rolls", name: "House Blend Joint", size: "1g",  price: 80 },
      { category: "Pre-Rolls", name: "Infused Pre-Roll",  size: "1.2g", price: 180, notes: "Kief-coated" },
      { category: "Edibles", name: "Gummies",          size: "100mg THC", price: 220 },
      { category: "Edibles", name: "Chocolate Bar",    size: "150mg THC", price: 250 },
      { category: "Concentrates", name: "Live Resin",  size: "1g",   price: 450 },
      { category: "Concentrates", name: "Hash",        size: "1g",   price: 180 },
      { category: "Vapes",   name: "510 Cartridge",    size: "0.5g", price: 380 },
      { category: "CBD",     name: "CBD Oil Tincture", size: "30ml (500mg)", price: 420, notes: "Wellness" },
    ],
  },
  {
    id: "leaf-labs",
    label: "LëF Labs · September 2026 Wholesale Catalogue",
    currency: "R",
    aliases: [
      "leaf labs", "leaflabs", "leaf-labs", "leaf lab",
      "lef labs", "leflabs", "lëf labs", "lef-labs", "lef lab",
    ],
    contact: "LëF Labs (Pty) Ltd · B2B wholesale · 071 806 5754",
    orderPhone: "0718065754",
    pdfUrl: leflabsCatalogue.url,
    hidePrices: true,
    priceNote: "On request",
    disclaimer:
      "LëF Labs September 2026 wholesale catalogue. B2B only — pricing, COAs and volume breaks on request by phone. Order minimums apply (100g on 4A Indoor & Indoor, 250g on the rest). 18+. Not medical advice.",
    items: [
      // ── Tier I · 4A Indoor (full-cycle indoor hydroponic, 100g min) ──
      { category: "4A Indoor · Tier I", name: "Blue Zushi", notes: "Hybrid · sweet candy-gas, balanced calm" },
      { category: "4A Indoor · Tier I", name: "Pure Michigan", notes: "Indica-leaning · grape-fuel, evening wind-down" },
      { category: "4A Indoor · Tier I", name: "Rainbow Royale", notes: "Hybrid · tropical candy, social and bright" },
      { category: "4A Indoor · Tier I", name: "BCP", notes: "Hybrid · pepper-forward caryophyllene profile" },
      { category: "4A Indoor · Tier I", name: "Guerilla Glue", notes: "Hybrid · pine-diesel, heavy body ease" },
      { category: "4A Indoor · Tier I", name: "Jack Herer", notes: "Sativa · pine-spice terpinolene, daytime focus" },
      { category: "4A Indoor · Tier I", name: "Blue Dream", notes: "Hybrid · berry, gentle all-rounder" },
      { category: "4A Indoor · Tier I", name: "Gorilla Zkittlez", notes: "Hybrid · sweet fuel, relaxed but clear" },
      { category: "4A Indoor · Tier I", name: "Divine Kush Breath", notes: "Indica-leaning · doughy kush, night use" },
      { category: "4A Indoor · Tier I", name: "Jungle Diamonds", notes: "Hybrid · gassy dessert, frosty bag appeal" },
      { category: "4A Indoor · Tier I", name: "Divinity", notes: "Hybrid · floral-sweet, even-keeled" },
      { category: "4A Indoor · Tier I", name: "Cold Snap", notes: "Hybrid · mentholated pine, crisp head feel" },
      { category: "4A Indoor · Tier I", name: "Cream Mandarin Diesel", notes: "Hybrid · citrus-cream limonene, uplifting" },
      { category: "4A Indoor · Tier I", name: "Alien Terminal", notes: "Hybrid · sour funk, potent" },
      { category: "4A Indoor · Tier I", name: "Jamaican Wedding", notes: "Hybrid · tropical-vanilla, sociable" },
      { category: "4A Indoor · Tier I", name: "Citradelic Sunset", notes: "Sativa-leaning · orange-zest, creative daytime" },
      { category: "4A Indoor · Tier I", name: "Garlic Sherbet", notes: "Hybrid · savoury gas over sherbet sweetness" },
      { category: "4A Indoor · Tier I", name: "Blueberry Blitz", notes: "Indica-leaning · blueberry myrcene, calming" },
      { category: "4A Indoor · Tier I", name: "Dank Wafers", notes: "Hybrid · biscuit-vanilla dessert profile" },
      { category: "4A Indoor · Tier I", name: "Persimmons", notes: "Hybrid · stone-fruit sweetness" },
      { category: "4A Indoor · Tier I", name: "Tart Pops", notes: "Back in supply · Hybrid · sour candy" },
      { category: "4A Indoor · Tier I", name: "Dip Stix", notes: "Back in supply · Hybrid · sweet-sour, punchy" },
      { category: "4A Indoor · Tier I", name: "Chem 5", notes: "Back in supply · Hybrid · classic chem funk" },
      { category: "4A Indoor · Tier I", name: "Animal Runtz", notes: "Back in supply · Hybrid · creamy candy, relaxed" },
      { category: "4A Indoor · Tier I", name: "Lemon Silver Haze", notes: "Back in supply · Sativa · lemon-haze, alert" },
      { category: "4A Indoor · Tier I", name: "Guava Bomba", notes: "Back in supply · Hybrid · tropical guava" },
      { category: "4A Indoor · Tier I", name: "Purple Ghost Candy", notes: "Back in supply · Indica-leaning · berry candy" },
      { category: "4A Indoor · Tier I", name: "Planet of the Grapes", notes: "Back in supply · Indica-leaning · grape, heavy" },

      // ── Tier II · Indoor (100g min) ──
      { category: "Indoor · Tier II", name: "Atomic Jelly", notes: "Hybrid · sweet jelly-fruit" },
      { category: "Indoor · Tier II", name: "Nightwalker", notes: "Indica-leaning · dark fruit, evening" },
      { category: "Indoor · Tier II", name: "Gelato 41", notes: "Hybrid · dessert-cream, balanced" },
      { category: "Indoor · Tier II", name: "Apples & Bananas", notes: "Hybrid · orchard-fruit sweetness" },
      { category: "Indoor · Tier II", name: "Wedding", notes: "Hybrid · vanilla-earth, relaxed" },
      { category: "Indoor · Tier II", name: "NanaGlue", notes: "Hybrid · banana meets glue funk" },
      { category: "Indoor · Tier II", name: "ChocoLope", notes: "Sativa · chocolate-coffee, daytime lift" },
      { category: "Indoor · Tier II", name: "King Bling", notes: "Hybrid · frosty, sweet gas" },
      { category: "Indoor · Tier II", name: "Sapphire Blue", notes: "Indica-leaning · blueberry, mellow" },
      { category: "Indoor · Tier II", name: "Runts", notes: "Hybrid · candy-fruit, easygoing" },
      { category: "Indoor · Tier II", name: "Candy Pane", notes: "Hybrid · sugary, light-hearted" },
      { category: "Indoor · Tier II", name: "Huckleberry Frost", notes: "Hybrid · tart berry, crisp" },
      { category: "Indoor · Tier II", name: "Colorado Nightshifter", notes: "Indica-leaning · sedating night pick" },
      { category: "Indoor · Tier II", name: "Tropicana Banana", notes: "Sativa-leaning · citrus-banana, bright" },
      { category: "Indoor · Tier II", name: "Peanut Butter Jelly Cake", notes: "Hybrid · nutty dessert, heavy-ish" },
      { category: "Indoor · Tier II", name: "Jamaican Wedding", notes: "Hybrid · tropical-vanilla" },
      { category: "Indoor · Tier II", name: "Strawberry Lemonade", notes: "Sativa-leaning · citrus-berry, refreshing" },
      { category: "Indoor · Tier II", name: "Juicy J", notes: "Hybrid · juicy fruit profile" },
      { category: "Indoor · Tier II", name: "Violet Cake", notes: "Indica-leaning · floral cake, calming" },
      { category: "Indoor · Tier II", name: "Wedding Cake", notes: "Hybrid · sweet vanilla, body-relaxing" },

      // ── Tier III · Greendoor (light-assisted, 250g min) ──
      { category: "Greendoor · Tier III", name: "X7M", notes: "Hybrid · gassy, indoor-like character" },
      { category: "Greendoor · Tier III", name: "Strwadawg", notes: "Hybrid · strawberry meets chemdawg" },
      { category: "Greendoor · Tier III", name: "Zwich Pavé", notes: "Hybrid · sweet dessert-gas" },
      { category: "Greendoor · Tier III", name: "Garlic Fusion", notes: "Hybrid · savoury garlic funk" },
      { category: "Greendoor · Tier III", name: "Nag", notes: "Hybrid · earthy-sweet" },
      { category: "Greendoor · Tier III", name: "Facade", notes: "Hybrid · balanced, easy smoke" },
      { category: "Greendoor · Tier III", name: "GG42", notes: "Hybrid · glue lineage, pine-fuel" },
      { category: "Greendoor · Tier III", name: "Sour Diesel Chemdawg", notes: "Sativa-leaning · sharp diesel, alert" },
      { category: "Greendoor · Tier III", name: "RS11", notes: "Back in supply · Hybrid · doughy-sweet" },
      { category: "Greendoor · Tier III", name: "Papaya", notes: "Back in supply · Indica-leaning · tropical, calming" },
      { category: "Greendoor · Tier III", name: "Organic Purple Panda", notes: "Organic sub-range · rated 4A quality" },
      { category: "Greendoor · Tier III", name: "Organic Slurry Boss", notes: "Organic sub-range · rated 4A quality" },
      { category: "Greendoor · Tier III", name: "Organic Ice Cream", notes: "Organic sub-range · rated 4A quality" },

      // ── Tier IV · Exotic Greenhouse (250g min) ──
      { category: "Exotic Greenhouse · Tier IV", name: "Black Cherry Tart", notes: "Indica-leaning · dark cherry" },
      { category: "Exotic Greenhouse · Tier IV", name: "Blunicorn", notes: "Hybrid · blueberry-cream" },
      { category: "Exotic Greenhouse · Tier IV", name: "Vibranium", notes: "Hybrid · sweet gas, potent for the tier" },
      { category: "Exotic Greenhouse · Tier IV", name: "Breakpad Breath", notes: "Hybrid · minty-kush" },
      { category: "Exotic Greenhouse · Tier IV", name: "Dirty Banana", notes: "Hybrid · banana-funk" },
      { category: "Exotic Greenhouse · Tier IV", name: "Cheese", notes: "Hybrid · sharp savoury classic" },
      { category: "Exotic Greenhouse · Tier IV", name: "Zkittlez Pop", notes: "Indica-leaning · candy-fruit" },
      { category: "Exotic Greenhouse · Tier IV", name: "Kimbo Kush", notes: "Back in supply · Indica · coffee-earth" },
      { category: "Exotic Greenhouse · Tier IV", name: "Endgame", notes: "Back in supply · Hybrid · fuel-sweet" },
      { category: "Exotic Greenhouse · Tier IV", name: "BT Mids & Pops", notes: "Same genetics, smaller nugs · on request, stock dependent" },

      // ── Tier V · Greenhouse (250g min) ──
      { category: "Greenhouse · Tier V", name: "Cherry Paloma", notes: "Hybrid · cherry-citrus" },
      { category: "Greenhouse · Tier V", name: "Kush Mintz", notes: "Hybrid · minty kush, relaxing" },
      { category: "Greenhouse · Tier V", name: "Dosidos", notes: "Indica-leaning · sweet earth, heavy" },
      { category: "Greenhouse · Tier V", name: "MK Ultra", notes: "Indica · classic sedating kush" },
      { category: "Greenhouse · Tier V", name: "Zeppelin", notes: "Hybrid · earthy-sweet everyday" },
      { category: "Greenhouse · Tier V", name: "Facility Surplus", notes: "Mixed everyday stock, availability dependent" },

      // ── Pops & raw material ──
      { category: "Pops & Mini Pops", name: "Pops · assorted small/medium", size: "from 250g bags", notes: "Drawn from any range on the list" },
      { category: "Pops & Mini Pops", name: "Mini Pops · small only", size: "from 250g bags", notes: "Greendoor or Indoor sourced" },
      { category: "Raw Material", name: "Untrimmed Bud", size: "250g min", notes: "Seedless, Greendoor-grown · not outdoor" },
      { category: "Raw Material", name: "Crush & Shake", size: "per gram", notes: "For buyers rolling their own pre-rolls" },

      // ── Pre-rolls & moonsticks (1.4g, 100 unit min) ──
      { category: "Pre-Rolls & Moonsticks", name: "Indoor Pre-Roll · glass tube", size: "1.4g", notes: "Indoor flower, premium packaging" },
      { category: "Pre-Rolls & Moonsticks", name: "Indoor Pre-Roll · plastic tube", size: "1.4g", notes: "Indoor flower" },
      { category: "Pre-Rolls & Moonsticks", name: "Greenhouse Pre-Roll · glass tube", size: "1.4g", notes: "Greenhouse flower" },
      { category: "Pre-Rolls & Moonsticks", name: "Greenhouse Pre-Roll · plastic tube", size: "1.4g", notes: "Greenhouse flower" },
      { category: "Pre-Rolls & Moonsticks", name: "Greenhouse Pre-Roll · standard", size: "1.4g", notes: "Everyday format" },
      { category: "Pre-Rolls & Moonsticks", name: "Indoor Moonstick", size: "1.4g", notes: "Kief-coated, premium" },
      { category: "Pre-Rolls & Moonsticks", name: "Greenhouse Moonstick", size: "1.4g", notes: "Kief-coated" },

      // ── Vapes (MOQ 20 units) ──
      { category: "Vapes", name: "Liquid Gold", notes: "Cartridge line" },
      { category: "Vapes", name: "Pure Leaf", notes: "Cartridge line" },
      { category: "Vapes", name: "Dirty Vapes", notes: "Cartridge line" },
      { category: "Vapes", name: "Funk't", notes: "New supplier this month" },
      { category: "Vapes", name: "Orphan Laboratory", notes: "New supplier this month" },

      // ── Edibles (MOQ 10 packs per flavour) ──
      { category: "Sour Edibles", name: "15mg standard pack", notes: "Cherry · Mango · Pineapple · Watermelon · Litchi" },
      { category: "Sour Edibles", name: "30mg premium pack", notes: "Elderflower · Green Apple · Cherry Cola" },

      // ── Concentrates ──
      { category: "Concentrates", name: "Dab / Honeycomb / Crumble", notes: "Skywalker · AK-47 · White Widow · Gorilla Glue" },
      { category: "Concentrates", name: "Distillate", notes: "Larger-quantity buyers · custom specs available" },

      // ── Delivery ──
      { category: "Delivery", name: "Same-day direct · Gauteng", notes: "Order by 11:00 for delivery before 15:00" },
      { category: "Delivery", name: "Nationwide PUDO locker", notes: "24–48 hours depending on location" },
    ],
  },

  {
    id: "dirty-vapes",
    label: "Dirty Vapes Menu",
    currency: "R",
    aliases: [
      "dirty vapes",
      "dirtyvapes",
      "dirty vape",
      "dirty vapes sa",
      "dirtyvapes sa",
      "dirty vape sa",
      "dirty vapes menu",
      "dirty vapes pdf",
      "dirty vapes prices",
      "dirty vapes catalogue",
    ],
    contact: "074 262 4491 · dirtyvapessa@gmail.com · tripplefourshophub.online/partners/dirty-vapes",
    disclaimer: "Prices in ZAR (May 2026). 18+ only. Not medical advice.",
    items: [
      { category: "Edibles", name: "Dirty Vapes Edibles Tub", size: "100mg",  price: 150 },
      { category: "Vapes",   name: "Dirty Vapes Cart",        size: "1ml",    price: 350 },
      { category: "Vapes",   name: "Dirty Vapes Disposable",  size: "1ml",    price: 450 },
      { category: "Vapes",   name: "Dirty Vapes SWITCH",      size: "2ml",    price: 900, notes: "Pod device" },
    ],
  },
];



// Any "what specials / deals / promos are around?" question surfaces the
// current partner catalogue (LëF Labs September 2026).
const SPECIALS_RE =
  /\b(specials?|deals?|promos?|promotions?|discounts?|offers?|catalogue|catalog|price\s*list|wholesale|bulk|what'?s\s+(on|new|hot)\s+(special|this month)?)\b/;

export const SPECIALS_MENU_ID = "leaf-labs";

/** Returns the matching menu if the user's message mentions a known dispensary/brand. */
export function matchMenuIntent(text: string): DispensaryMenu | null {
  // Normalize: lowercase + strip diacritics (so "Lëf" matches "lef")
  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lower = normalize(text);

  // "Any specials around?" → current partner catalogue.
  if (SPECIALS_RE.test(lower)) {
    return DISPENSARY_MENUS.find((m) => m.id === SPECIALS_MENU_ID) ?? null;
  }

  // If the user is asking for a location/hours ("where is …", "near me",
  // "open", "hours", "address", etc.) let the dispensary handler answer
  // instead of hijacking the reply with a price menu.
  const LOCATION_INTENT_RE =
    /\b(where|near\s*me|nearby|closest|nearest|location|address|directions?|open(ing)?|hours?|store|shop\s*(near|around|close)|find)\b/;
  if (LOCATION_INTENT_RE.test(lower)) return null;

  // Otherwise, if a known dispensary/brand alias is mentioned, show its menu.
  for (const m of DISPENSARY_MENUS) {
    if (m.aliases.some((a) => lower.includes(normalize(a)))) return m;
  }

  return null;

}


