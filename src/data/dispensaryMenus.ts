// Registry of dispensary menu PDFs shown inline in the chat.
// Drop the PDF into `public/menus/` and add an entry here.
// Match triggers on the user typing e.g. "tripple444 menu", "leaf labs menu".

export interface DispensaryMenu {
  id: string;
  label: string;
  pdfUrl: string;      // public path or absolute URL
  aliases: string[];   // lowercase name variants (without the word "menu")
}

export const DISPENSARY_MENUS: DispensaryMenu[] = [
  {
    id: "tripple444",
    label: "Tripple444 Menu",
    pdfUrl: "/menus/tripple444-menu.pdf",
    aliases: ["tripple444", "tripple 444", "triple444", "triple 444", "tripple four", "triple four"],
  },
  {
    id: "leaf-labs",
    label: "Leaf Labs Menu",
    pdfUrl: "/menus/leaf-labs-menu.pdf",
    aliases: ["leaf labs", "leaflabs", "leaf-labs"],
  },
];

/** Returns the matching menu if the user's message mentions a dispensary + "menu". */
export function matchMenuIntent(text: string): DispensaryMenu | null {
  const lower = text.toLowerCase();
  if (!/\bmenu|catalog|catalogue|price\s*list\b/i.test(lower)) return null;
  for (const m of DISPENSARY_MENUS) {
    if (m.aliases.some((a) => lower.includes(a))) return m;
  }
  return null;
}
