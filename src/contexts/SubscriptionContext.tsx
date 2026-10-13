import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const PREMIUM_TIER = {
  name: "Cuddles Premium",
  price: "R99",
  interval: "month",
};

type Plan = "premium" | "pro";

interface SubscriptionContextType {
  isPremium: boolean;
  plan: Plan | null;
  isLoading: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
  startCheckout: (opts?: { plan?: Plan; returnPath?: string }) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setPlan(null);
      setSubscriptionEnd(null);
      return;
    }

    // Always use a fresh, valid access token — never let the anon key be forwarded.
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      // No valid session yet; keep current state instead of downgrading the user.
      return;
    }

    const invoke = (token: string) =>
      supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
    const is401 = (e: unknown) =>
      (e as { context?: { status?: number } } | null)?.context?.status === 401;

    try {
      setIsLoading(true);
      let { data, error } = await invoke(accessToken);
      if (error && is401(error)) {
        // Cached token was expired or revoked — refresh once and retry.
        const { data: refreshed } = await supabase.auth.refreshSession();
        const fresh = refreshed.session?.access_token;
        if (!fresh) {
          // Session is no longer valid; sign out locally so the app doesn't keep failing.
          await supabase.auth.signOut({ scope: "local" });
          return;
        }
        ({ data, error } = await invoke(fresh));
      }
      if (error) {
        if (is401(error)) return; // Not signed in validly; stay quiet.
        throw error;
      }
      setIsPremium(data?.subscribed ?? false);
      setPlan((data?.plan as Plan) ?? null);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (err) {
      // Transient failures should not silently downgrade a paying member.
      console.warn("Subscription check unavailable:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription, session?.access_token]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const startCheckout = async (opts?: { plan?: Plan; returnPath?: string }) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: opts?.plan ?? "premium", return_path: opts?.returnPath },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error creating Stripe checkout:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{ isPremium, plan, isLoading, subscriptionEnd, checkSubscription, startCheckout }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
  return context;
};
