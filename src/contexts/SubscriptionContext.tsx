import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Stripe product/price mapping
export const PREMIUM_TIER = {
  product_id: "prod_UE40MKZjULwaNJ",
  price_id: "price_1TFbsIGD6Z27Vz01qJGDG4OI",
  name: "Cuddles Premium",
  price: "R99",
  interval: "month",
};

interface SubscriptionContextType {
  isPremium: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
  startCheckout: () => Promise<void>;
  openPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setSubscriptionEnd(null);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setIsPremium(data?.subscribed ?? false);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (err) {
      console.error("Error checking subscription:", err);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const startCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: PREMIUM_TIER.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      console.error("Error creating checkout:", err);
    }
  };

  const openPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      console.error("Error opening portal:", err);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, isLoading, subscriptionEnd, checkSubscription, startCheckout, openPortal }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
  return context;
};
