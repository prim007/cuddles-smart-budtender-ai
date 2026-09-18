import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { DISPENSARY_MENUS } from "@/data/dispensaryMenus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Check, ArrowRight, Leaf, Phone } from "lucide-react";

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const typeColor = (type?: string | null) => {
  switch ((type || "").toLowerCase()) {
    case "indica":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
    case "sativa":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
    default:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
  }
};

/** Reads "Indica-leaning · berry" style notes into a plain strain type. */
const typeFromNotes = (notes?: string) => {
  const n = (notes || "").toLowerCase();
  if (n.includes("sativa")) return "Sativa";
  if (n.includes("indica")) return "Indica";
  return "Hybrid";
};

interface PartnerStock {
  /** Partner shop name, e.g. "LëF Labs". */
  label: string;
  /** Tel number the Order button dials. */
  phone?: string;
  /** Menu tier / category the item sits in. */
  tier?: string;
  /** Shown in place of a price when the partner keeps pricing private. */
  priceNote?: string;
}

interface Result {
  key: string;
  name: string;
  slug: string;
  type: string;
  effect: string | null;
  terpene: string | null;
  thc: string | null;
  description: string | null;
  /** Present only when a partner shop actually stocks it */
  shopId: string | null;
  price: number | null;
  /** Present when a partner catalogue lists it (phone orders) */
  partner: PartnerStock | null;
}

/** Every strain listed on a partner catalogue, flattened for search. */
const PARTNER_ITEMS: Result[] = DISPENSARY_MENUS.filter((menu) => !!menu.orderPhone).flatMap((menu) =>
  menu.items
    .filter((item) => !/pre-?roll|gumm|chocolate|cartridge|tincture|oil|hash|resin|joint/i.test(item.name))
    .map((item) => ({
      key: item.name.toLowerCase(),
      name: item.name,
      slug: slugify(item.name),
      type: typeFromNotes(item.notes),
      effect: null,
      terpene: null,
      thc: null,
      description: item.notes ?? null,
      shopId: null,
      price: menu.hidePrices ? null : item.price ?? null,
      partner: {
        label: menu.label.split("·")[0].trim(),
        phone: menu.orderPhone,
        tier: item.category,
        priceNote: menu.hidePrices ? menu.priceNote ?? "On request" : undefined,
      },
    })),
);

const FILTERS = ["all", "indica", "sativa", "hybrid", "in stock"] as const;
type Filter = (typeof FILTERS)[number];


const ProductSearch = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { addItem, items } = useCart();

  const { data, isLoading, error } = useQuery({
    queryKey: ["budtender-catalogue"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const [shop, library] = await Promise.all([
        supabase
          .from("tenant_strains")
          .select("id, strain_name, strain_type, primary_effect, primary_terpene, thc_min, thc_max, price, in_stock, notes")
          .order("strain_name"),
        supabase
          .from("strain_profiles")
          .select("strain_slug, strain_name, strain_type, short_description, thc_range, effects")
          .order("strain_name"),
      ]);
      if (shop.error) throw shop.error;
      if (library.error) throw library.error;
      return { shop: shop.data ?? [], library: library.data ?? [] };
    },
  });

  const results = useMemo<Result[]>(() => {
    const byName = new Map<string, Result>();

    for (const p of data?.library ?? []) {
      const key = p.strain_name.toLowerCase();
      const effects = Array.isArray(p.effects) ? (p.effects as unknown[]) : [];
      byName.set(key, {
        key,
        name: p.strain_name,
        slug: p.strain_slug || slugify(p.strain_name),
        type: p.strain_type || "Hybrid",
        effect: typeof effects[0] === "string" ? (effects[0] as string) : null,
        terpene: null,
        thc: p.thc_range ?? null,
        description: p.short_description ?? null,
        shopId: null,
        price: null,
        partner: null,
      });
    }

    // Partner catalogues (e.g. LëF Labs) — searchable, ordered by phone.
    for (const item of PARTNER_ITEMS) {
      const existing = byName.get(item.key);
      byName.set(item.key, {
        ...item,
        slug: existing?.slug ?? item.slug,
        type: existing?.type ?? item.type,
        effect: existing?.effect ?? item.effect,
        thc: existing?.thc ?? item.thc,
        description: existing?.description ?? item.description,
      });
    }

    for (const s of data?.shop ?? []) {
      const key = s.strain_name.toLowerCase();
      const existing = byName.get(key);
      const thc =
        s.thc_min != null && s.thc_max != null ? `${s.thc_min}–${s.thc_max}%` : existing?.thc ?? null;
      const merged: Result = {
        key,
        name: s.strain_name,
        slug: existing?.slug ?? slugify(s.strain_name),
        type: s.strain_type || existing?.type || "Hybrid",
        effect: s.primary_effect ?? existing?.effect ?? null,
        terpene: s.primary_terpene ?? null,
        thc,
        description: existing?.description ?? s.notes ?? null,
        shopId: s.in_stock && s.price != null ? s.id : existing?.shopId ?? null,
        price: s.in_stock && s.price != null ? Number(s.price) : existing?.price ?? null,
        partner: existing?.partner ?? null,
      };
      byName.set(key, merged);
    }

    const q = search.trim().toLowerCase();
    const stocked = (r: Result) => r.shopId != null || r.partner != null;
    return [...byName.values()]
      .filter((r) => {
        const matchesText =
          !q ||
          r.name.toLowerCase().includes(q) ||
          (r.effect || "").toLowerCase().includes(q) ||
          (r.terpene || "").toLowerCase().includes(q) ||
          (r.partner?.tier || "").toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q);
        const matchesFilter =
          filter === "all" ||
          (filter === "in stock" ? stocked(r) : r.type.toLowerCase() === filter);
        return matchesText && matchesFilter;
      })
      .sort((a, b) => {
        const rank = (r: Result) => (r.shopId ? 2 : r.partner ? 1 : 0);
        if (rank(b) !== rank(a)) return rank(b) - rank(a);
        return a.name.localeCompare(b.name);
      });
  }, [data, search, filter]);


  const inCart = (id: string | null) => !!id && items.some((i) => i.strainId === id);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a strain, an effect like sleep, or a flavour"
          className="h-12 pl-10 text-base"
          aria-label="Search products and strains"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="rounded-full capitalize"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {error && (
        <p className="mt-8 text-sm text-destructive">
          We couldn't load the catalogue just now. Please refresh and try again.
        </p>
      )}

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <div
                key={r.key}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-foreground">{r.name}</h3>
                  {r.price != null ? (
                    <span className="shrink-0 font-semibold text-primary">R{r.price.toFixed(0)}</span>
                  ) : (
                    r.partner?.priceNote && (
                      <span className="shrink-0 text-sm font-medium text-muted-foreground">
                        {r.partner.priceNote}
                      </span>
                    )
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className={typeColor(r.type)}>
                    {r.type}
                  </Badge>
                  {r.effect && (
                    <Badge variant="outline" className="bg-muted/50">
                      {r.effect}
                    </Badge>
                  )}
                  {r.shopId ? (
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      In stock
                    </Badge>
                  ) : r.partner ? (
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      At {r.partner.label}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                      Guide only
                    </Badge>
                  )}
                </div>

                {(r.thc || r.terpene || r.partner?.tier) && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <Leaf className="mr-1 inline h-3.5 w-3.5" />
                    {[r.terpene, r.thc ? `THC ${r.thc}` : null, r.partner?.tier]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {r.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                )}


                <div className="mt-4 flex items-center gap-2 pt-1">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/strains/${r.slug}`}>
                      Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  {r.shopId && r.price != null && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        addItem({
                          strainId: r.shopId as string,
                          strainName: r.name,
                          strainType: r.type,
                          price: r.price as number,
                        })
                      }
                    >
                      {inCart(r.shopId) ? (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add
                        </>
                      )}
                    </Button>
                  )}
                  {!r.shopId && r.partner?.phone && (
                    <Button asChild size="sm" className="flex-1">
                      <a href={`tel:${r.partner.phone}`}>
                        <Phone className="mr-1 h-3.5 w-3.5" /> Order
                      </a>
                    </Button>
                  )}

                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && !error && (
            <div className="py-16 text-center text-muted-foreground">
              Nothing matched that. Try a simpler word, like "sleep" or "citrus".
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductSearch;
