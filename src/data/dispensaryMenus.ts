// Dispensary menus shown inline in the chat.
// Add a new partner by pushing to DISPENSARY_MENUS.
// Prices are in ZAR unless the entry says otherwise.

export interface MenuItem {
  name: string;
  category?: string;   // e.g. "Flower", "Edibles", "Concentrates"
  size?: string;       // e.g. "1g", "3.5g", "100mg"
  price: number;       // numeric price
  notes?: string;      // optional short note (THC%, effect)
}

export interface DispensaryMenu {
  id: string;
  label: string;
  currency: string;         // "R", "$", etc
  aliases: string[];        // lowercase name variants (without "menu")
  contact?: string;         // phone / WhatsApp
  disclaimer?: string;
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
    label: "Lëf Labs Wholesale Catalogue",
    currency: "R",
    aliases: ["leaf labs", "leaflabs", "leaf-labs", "leaf lab", "lef labs", "lëf labs", "lef-labs"],
    contact: "B2B · 071 806 5754 · tripplefourshophub.online/partners/lef-labs",
    disclaimer: "Wholesale ZAR pricing (May 2026). COA per batch. B2B partners only. Not medical advice.",
    items: [
      // Indoor Flower — Partner A
      { category: "Indoor Flower", name: "Animal Runtz",         size: "1g (single-nug)", price: 120, notes: "Hybrid · Sweet/Fruity" },
      { category: "Indoor Flower", name: "Lemon Silver Haze",    size: "1g (single-nug)", price: 120, notes: "Sativa · Citrus/Earthy" },
      { category: "Indoor Flower", name: "Guava Bomba",          size: "1g (single-nug)", price: 120, notes: "Hybrid · Tropical/Floral" },
      { category: "Indoor Flower", name: "Purple Ghost Candy",   size: "1g (single-nug)", price: 120, notes: "Indica · Berry/Candy" },
      // Tunnel Flower — Partner B
      { category: "Tunnel Flower (AAA)", name: "Jack Herer",           size: "1g", price: 70, notes: "Sativa · Spicy/Pine" },
      { category: "Tunnel Flower (AAA)", name: "Planet of the Grapes", size: "1g", price: 70, notes: "Indica · Grape/Earthy" },
      { category: "Tunnel Flower (AAA)", name: "Gorilla Skittles",     size: "1g", price: 70, notes: "Hybrid · Sweet/Diesel" },
      { category: "Tunnel Flower (A)",   name: "Cheese",               size: "1g", price: 40, notes: "Hybrid · Sharp/Savoury" },
      { category: "Tunnel Flower (A)",   name: "Kimbo Kush",           size: "1g", price: 40, notes: "Indica · Coffee/Earthy" },
      { category: "Tunnel Flower (A)",   name: "Endgame",              size: "1g", price: 40, notes: "Hybrid · Fuel/Sweet" },
      // Pre-Rolls
      { category: "Pre-Rolls", name: "Standard Pre-Roll",       size: "1g",   price: 35, notes: "Tunnel popcorn blend" },
      { category: "Pre-Rolls", name: "Premium Pre-Roll",        size: "1g",   price: 55, notes: "Indoor multi-nug" },
      { category: "Pre-Rolls", name: "Moon Stick (infused)",    size: "1g",   price: 85, notes: "Indoor + kief coat" },
      { category: "Pre-Rolls", name: "Mini 5-Pack",             size: "5×0.5g", price: 80, notes: "Tunnel blend" },
      // Vapes — Partner D
      { category: "Vapes", name: "Liquid Gold Disposable",  size: "0.5ml", price: 320, notes: "THC distillate" },
      { category: "Vapes", name: "Liquid Gold Disposable",  size: "1ml",   price: 480, notes: "THC distillate" },
      { category: "Vapes", name: "Liquid Gold 510 Cart",    size: "1ml",   price: 380, notes: "THC distillate" },
      { category: "Vapes", name: "Pure Leaf Disposable",    size: "1ml",   price: 400, notes: "Full spectrum" },
      { category: "Vapes", name: "Pure Leaf 510 Cart",      size: "1ml",   price: 400, notes: "Full spectrum" },
      { category: "Vapes", name: "Pure Leaf Mini Disposable", size: "0.5ml", price: 260, notes: "Full spectrum" },
      // Distillates & Concentrates
      { category: "Distillates", name: "THC Distillate",           size: "1g", price: 280, notes: "90–95% purity" },
      { category: "Distillates", name: "CBD Distillate",           size: "1g", price: 180, notes: "80–90% purity" },
      { category: "Distillates", name: "Full Spectrum Distillate", size: "1g", price: 160, notes: "70–80% purity" },
      { category: "Concentrates", name: "Live Resin",              size: "1g", price: 320, notes: "65–80% THC" },
      { category: "Concentrates", name: "Wax / Shatter",           size: "1g", price: 220, notes: "70–85% THC" },
      { category: "Concentrates", name: "Rosin (solventless)",     size: "1g", price: 380, notes: "60–75% THC" },
      { category: "Concentrates", name: "Kief",                    size: "1g", price: 120, notes: "40–60% THC" },
    ],
  },
  {
    id: "dirty-vapes",
    label: "Dirty Vapes Menu",
    currency: "R",
    aliases: ["dirty vapes", "dirtyvapes", "dirty vape"],
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



/** Returns the matching menu if the user's message mentions a dispensary + "menu"/"prices". */
export function matchMenuIntent(text: string): DispensaryMenu | null {
  const lower = text.toLowerCase();
  if (!/\b(menu|catalog|catalogue|price\s*list|prices|pricing)\b/i.test(lower)) return null;
  for (const m of DISPENSARY_MENUS) {
    if (m.aliases.some((a) => lower.includes(a))) return m;
  }
  return null;
}
