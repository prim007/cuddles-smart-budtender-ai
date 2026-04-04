import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Leaf,
  Truck,
} from "lucide-react";

const Shop = () => {
  const { addItem, items, itemCount, subtotal, updateQuantity } = useCart();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: strains, isLoading } = useQuery({
    queryKey: ["shop-strains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_strains")
        .select("*")
        .eq("in_stock", true)
        .order("strain_name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = strains?.filter((s) => {
    const matchSearch =
      s.strain_name.toLowerCase().includes(search.toLowerCase()) ||
      s.primary_effect?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || s.strain_type.toLowerCase() === filterType;
    return matchSearch && matchType;
  });

  const getCartQty = (id: string) =>
    items.find((i) => i.strainId === id)?.quantity || 0;

  const typeColors: Record<string, string> = {
    Indica: "bg-purple-500/10 text-purple-600 border-purple-200",
    Sativa: "bg-amber-500/10 text-amber-600 border-amber-200",
    Hybrid: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  };

  return (
    <>
      <SEO
        title="Order Cannabis Delivery | Cuddles AI"
        description="Order cannabis for delivery. Browse strains, add to cart, and get it delivered to your door."
      />
      <div className="min-h-screen bg-background pt-20">
        {/* Urgency banner */}
        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-center py-2 text-sm font-medium">
          🔥 Free delivery on orders over R500 · Order now, delivered today
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cuddles
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Truck className="w-7 h-7 text-primary" />
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Order Delivery
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Browse · Add to cart · Get it delivered 🚀
                </p>
              </div>
              <Link to="/checkout">
                <Button
                  size="lg"
                  className="relative rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search strains or effects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              {["all", "indica", "sativa", "hybrid"].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="rounded-xl capitalize"
                >
                  {type === "all" ? "All" : type}
                </Button>
              ))}
            </div>
          </div>

          {/* Subtotal bar */}
          {itemCount > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-foreground">
                {itemCount} item{itemCount > 1 ? "s" : ""} · Subtotal: R{subtotal.toFixed(2)}
              </span>
              <Link to="/checkout">
                <Button size="sm" className="rounded-xl">
                  Checkout →
                </Button>
              </Link>
            </div>
          )}

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : !filtered?.length ? (
            <div className="text-center py-16">
              <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No strains found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((strain) => {
                const qty = getCartQty(strain.id);
                return (
                  <div
                    key={strain.id}
                    className="rounded-2xl bg-card border border-border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-lg">
                          {strain.strain_name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs mt-1 ${typeColors[strain.strain_type] || ""}`}
                        >
                          {strain.strain_type}
                        </Badge>
                      </div>
                      <span className="font-display font-bold text-xl text-primary">
                        R{strain.price?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    {strain.primary_effect && (
                      <p className="text-sm text-muted-foreground mb-1">
                        ✨ {strain.primary_effect}
                      </p>
                    )}
                    {strain.primary_terpene && (
                      <p className="text-xs text-muted-foreground mb-3">
                        🌿 {strain.primary_terpene}
                        {strain.secondary_terpene && ` · ${strain.secondary_terpene}`}
                      </p>
                    )}
                    {strain.thc_min != null && strain.thc_max != null && (
                      <p className="text-xs text-muted-foreground mb-4">
                        THC: {strain.thc_min}–{strain.thc_max}%
                        {strain.cbd_min != null && strain.cbd_max != null &&
                          ` · CBD: ${strain.cbd_min}–${strain.cbd_max}%`}
                      </p>
                    )}

                    {qty === 0 ? (
                      <Button
                        className="w-full rounded-xl"
                        onClick={() =>
                          addItem({
                            strainId: strain.id,
                            strainName: strain.strain_name,
                            strainType: strain.strain_type,
                            price: strain.price || 0,
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => updateQuantity(strain.id, qty - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold text-foreground">{qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => updateQuantity(strain.id, qty + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky checkout bar */}
        {itemCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-4 z-50 animate-in slide-in-from-bottom">
            <div className="container mx-auto flex items-center justify-between max-w-4xl">
              <div>
                <p className="font-semibold text-foreground">
                  {itemCount} item{itemCount > 1 ? "s" : ""} · R{subtotal.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subtotal >= 500 ? "✅ Free delivery!" : `Add R${(500 - subtotal).toFixed(2)} for free delivery`}
                </p>
              </div>
              <Link to="/checkout">
                <Button size="lg" className="rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-semibold px-8">
                  Checkout →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Shop;
