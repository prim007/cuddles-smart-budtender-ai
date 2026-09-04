import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocateFixed, Search, Store } from "lucide-react";
import ChatDispensaryCards, { type Dispensary } from "@/components/ChatDispensaryCards";

const getBrowserLocation = (timeoutMs = 8000): Promise<{ lat: number; lng: number } | null> => {
  if (!("geolocation" in navigator)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
};

const DispensaryFinderPanel = () => {
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Dispensary[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const search = async (args: { lat?: number; lng?: number; address?: string }) => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke("daggaspot-dispensaries", {
        body: { ...args, limit: 8 },
      });
      if (error) throw error;
      const list: Dispensary[] = Array.isArray(data?.dispensaries) ? data.dispensaries : [];
      setResults(list);
      if (list.length === 0) setMessage("No shops listed for that area yet. Try a nearby city.");
    } catch {
      setResults(null);
      setMessage("We couldn't reach the shop directory right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = async () => {
    setLoading(true);
    setMessage(null);
    const loc = await getBrowserLocation();
    if (!loc) {
      setLoading(false);
      setMessage("We couldn't get your location. Type a town or city instead.");
      return;
    }
    await search(loc);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && place.trim()) search({ address: place.trim() });
            }}
            placeholder="Town or city, e.g. Cape Town"
            className="h-12 pl-10 text-base"
            aria-label="Town or city"
          />
        </div>
        <Button
          className="h-12"
          disabled={loading || !place.trim()}
          onClick={() => search({ address: place.trim() })}
        >
          Find shops
        </Button>
        <Button variant="outline" className="h-12" disabled={loading} onClick={useMyLocation}>
          <LocateFixed className="mr-2 h-4 w-4" /> Near me
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Looking for shops…</p>}

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {results && results.length > 0 && <ChatDispensaryCards dispensaries={results} />}

      {!results && !loading && !message && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <Store className="mx-auto mb-3 h-6 w-6" />
          Search a town or use your location to see real shops near you.
        </div>
      )}
    </div>
  );
};

export default DispensaryFinderPanel;
