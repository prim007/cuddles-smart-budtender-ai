import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import { trackEvent } from "@/components/GoogleAnalytics";

/**
 * Shows a popup when the user moves their cursor toward the top of the viewport
 * (exit intent) while they have items in their cart.
 */
const ExitIntentCartReminder = () => {
  const { itemCount, subtotal } = useCart();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || itemCount === 0) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger only when cursor moves toward the top of the page
      if (e.clientY <= 5 && !dismissed) {
        setShow(true);
        trackEvent("exit_intent", "cart_reminder", `${itemCount}_items`);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [itemCount, dismissed]);

  // Also hide if cart becomes empty
  useEffect(() => {
    if (itemCount === 0) setShow(false);
  }, [itemCount]);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative mx-4 max-w-md w-full rounded-2xl bg-card border border-border p-6 shadow-elevated animate-scale-in">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            Wait — you left items behind!
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            You have{" "}
            <span className="font-semibold text-foreground">{itemCount} item{itemCount > 1 ? "s" : ""}</span>{" "}
            worth{" "}
            <span className="font-semibold text-primary">R{subtotal.toFixed(2)}</span>{" "}
            in your cart.
          </p>

          <div className="flex flex-col gap-2">
            <Link to="/checkout" onClick={() => trackEvent("exit_intent_click", "checkout", "cart_reminder")}>
              <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display py-5">
                Complete Your Order 🚀
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-muted-foreground">
              I'll come back later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentCartReminder;
