import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Check } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";

interface StrainMatch {
  id: string;
  strain_name: string;
  strain_type: string;
  price: number | null;
  primary_effect: string | null;
}

/**
 * Parses AI response text for strain names and renders inline Add-to-Cart cards.
 * Shown below an assistant message when strain names match the catalog.
 */
const ChatStrainCard = ({ messageContent }: { messageContent: string }) => {
  const { addItem, items } = useCart();
  const [matchedStrains, setMatchedStrains] = useState<StrainMatch[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const findStrains = async () => {
      // Fetch all in-stock strains and match against the message content
      const { data } = await supabase
        .from("tenant_strains")
        .select("id, strain_name, strain_type, price, primary_effect")
        .eq("in_stock", true);

      if (cancelled || !data) return;

      const lowerContent = messageContent.toLowerCase();
      const matches = data.filter((s) =>
        lowerContent.includes(s.strain_name.toLowerCase())
      );

      // Limit to top 3
      setMatchedStrains(matches.slice(0, 3));
    };

    findStrains();
    return () => { cancelled = true; };
  }, [messageContent]);

  if (matchedStrains.length === 0) return null;

  const isInCart = (id: string) =>
    items.some((i) => i.strainId === id) || addedIds.has(id);

  const handleAdd = (strain: StrainMatch) => {
    addItem({
      strainId: strain.id,
      strainName: strain.strain_name,
      strainType: strain.strain_type,
      price: strain.price || 0,
    });
    setAddedIds((prev) => new Set(prev).add(strain.id));
    trackEvent("add_to_cart", "chat_bridge", strain.strain_name);
  };

  return (
    <div className="mt-2 space-y-2">
      {matchedStrains.map((strain) => (
        <div
          key={strain.id}
          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {strain.strain_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {strain.strain_type}
              {strain.primary_effect && ` · ${strain.primary_effect}`}
            </p>
          </div>
          {strain.price != null && (
            <span className="text-sm font-bold text-primary whitespace-nowrap">
              R{strain.price.toFixed(2)}
            </span>
          )}
          <Button
            size="sm"
            variant={isInCart(strain.id) ? "secondary" : "default"}
            className="rounded-lg gap-1 text-xs shrink-0"
            onClick={() => handleAdd(strain)}
            disabled={isInCart(strain.id)}
          >
            {isInCart(strain.id) ? (
              <>
                <Check className="w-3 h-3" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" /> Add
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ChatStrainCard;
