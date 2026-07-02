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
    label: "Leaf Labs Menu",
    currency: "R",
    aliases: ["leaf labs", "leaflabs", "leaf-labs", "leaf lab"],
    contact: "Partner dispensary",
    disclaimer: "Prices in ZAR. Availability may vary. Not medical advice.",
    items: [
      { category: "Flower", name: "Blue Dream",        size: "1g",   price: 160, notes: "Sativa-hybrid" },
      { category: "Flower", name: "Wedding Cake",      size: "1g",   price: 190, notes: "Indica-hybrid" },
      { category: "Flower", name: "Sour Diesel",       size: "1g",   price: 170, notes: "Sativa · energetic" },
      { category: "Flower", name: "Northern Lights",   size: "3.5g", price: 580, notes: "Indica · sleep" },
      { category: "Edibles", name: "Micro-dose Mints", size: "5mg × 20", price: 260 },
      { category: "Edibles", name: "Fruit Chews",      size: "10mg × 10", price: 240 },
      { category: "Concentrates", name: "Rosin",       size: "1g",   price: 520, notes: "Solventless" },
      { category: "Vapes",   name: "Disposable Vape",  size: "0.5g", price: 350 },
      { category: "CBD",     name: "CBD Softgels",     size: "25mg × 30", price: 480 },
      { category: "CBD",     name: "CBD Balm",         size: "50ml (750mg)", price: 380, notes: "Topical" },
    ],
  },
  {
    id: "dirty-vapes",
    label: "Dirty Vapes Menu",
    currency: "R",
    aliases: ["dirty vapes", "dirtyvapes", "dirty vape"],
    contact: "88 Vape Avenue, Rosebank, Johannesburg · +27 11 876 5432 · dirtyvapes.co.za",
    disclaimer: "Prices in ZAR. Indicative pricing — confirm in-store. 18+ only. Not medical advice.",
    items: [
      { category: "Pod Systems", name: "Starter Pod Kit",       size: "1 device", price: 350, notes: "Refillable" },
      { category: "Pod Systems", name: "Advanced Pod Mod",      size: "1 device", price: 650, notes: "Adjustable wattage" },
      { category: "Pod Systems", name: "Replacement Pods",      size: "3-pack",   price: 180 },
      { category: "E-Liquids",   name: "Fruit Blend E-Liquid",  size: "30ml",     price: 180, notes: "3-12mg nic" },
      { category: "E-Liquids",   name: "Dessert E-Liquid",      size: "60ml",     price: 280 },
      { category: "E-Liquids",   name: "Menthol E-Liquid",      size: "30ml",     price: 180 },
      { category: "E-Liquids",   name: "Nic Salt E-Liquid",     size: "30ml",     price: 220, notes: "20-50mg salt nic" },
      { category: "Accessories", name: "Replacement Coils",     size: "5-pack",   price: 200 },
      { category: "Accessories", name: "Battery / Charger",     size: "1 unit",   price: 250 },
      { category: "Accessories", name: "Drip Tip",              size: "1 unit",   price: 80 },
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
