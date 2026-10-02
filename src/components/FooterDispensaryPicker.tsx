import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ZA_CITIES, type ZaCity } from "@/data/zaCities";
import ChatDispensaryCards, { type Dispensary } from "@/components/ChatDispensaryCards";

type State = { status: "idle" | "loading" | "done" | "error"; list: Dispensary[] };

const FooterDispensaryPicker = () => {
  const [city, setCity] = useState<ZaCity | null>(null);
  const [state, setState] = useState<State>({ status: "idle", list: [] });

  const pick = async (c: ZaCity) => {
    if (city?.slug === c.slug) {
      setCity(null);
      return;
    }
    setCity(c);
    setState({ status: "loading", list: [] });
    try {
      const { data, error } = await supabase.functions.invoke("daggaspot-dispensaries", {
        body: { lat: c.lat, lng: c.lng, address: `${c.name}, South Africa`, limit: 10 },
      });
      if (error) throw error;
      const list: Dispensary[] = Array.isArray(data?.dispensaries) ? data.dispensaries.slice(0, 10) : [];
      setState({ status: "done", list });
    } catch {
      setState({ status: "error", list: [] });
    }
  };

  return (
    <div className="pt-6 border-t border-border">
      <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
        <MapPin className="w-4 h-4" /> Find a dispensary near you
      </h4>
      <p className="text-xs text-muted-foreground mb-3">Tap a city to see up to 10 shops there.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ZA_CITIES.map((c) => {
          const active = city?.slug === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => pick(c)}
              aria-pressed={active}
              className={`text-xs rounded-full border px-3 py-1 transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {city && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4" aria-live="polite">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-medium text-foreground">Dispensaries in {city.name}</p>
            <Link to={`/dispensary-near-me/${city.slug}`} className="text-xs underline text-muted-foreground hover:text-foreground">
              Full {city.name} guide
            </Link>
          </div>
          {state.status === "loading" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Finding shops…
            </p>
          )}
          {state.status === "error" && (
            <p className="text-sm text-muted-foreground">We couldn't reach the shop list right now. Please try again soon.</p>
          )}
          {state.status === "done" && state.list.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="w-4 h-4" /> No dispensary near you yet in {city.name}. Try a nearby city.
            </p>
          )}
          {state.status === "done" && state.list.length > 0 && <ChatDispensaryCards dispensaries={state.list} />}
        </div>
      )}
    </div>
  );
};

export default FooterDispensaryPicker;
