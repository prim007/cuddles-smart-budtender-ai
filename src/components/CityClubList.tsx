import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatDispensaryCards, { type Dispensary } from "@/components/ChatDispensaryCards";

interface Props {
  cityName: string;
  lat: number;
  lng: number;
}

/** Live list of clubs/shops listed near a city centre, from the DaggaSpot directory. */
const CityClubList = ({ cityName, lat, lng }: Props) => {
  const [results, setResults] = useState<Dispensary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setResults(null);
    setFailed(false);
    supabase.functions
      .invoke("daggaspot-dispensaries", { body: { lat, lng, limit: 8 } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setFailed(true);
          return;
        }
        setResults(Array.isArray(data?.dispensaries) ? data.dispensaries : []);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (failed) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        We couldn't load the {cityName} list right now. Please refresh in a moment, or ask Cuddles in the chat.
      </p>
    );
  }
  if (!results) {
    return <p className="mt-4 text-sm text-muted-foreground">Loading places listed in {cityName}…</p>;
  }
  if (results.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        No places are listed near {cityName} yet. Try a nearby city below.
      </p>
    );
  }
  return (
    <div>
      <ChatDispensaryCards dispensaries={results} />
      <p className="mt-3 text-xs text-muted-foreground">
        Listings from{" "}
        <a href="https://daggaspot.co.za" target="_blank" rel="noopener noreferrer" className="underline">
          DaggaSpot
        </a>
        . Distances are from the {cityName} city centre. Cuddles doesn't check opening hours, stock or membership rules — call before you go.
      </p>
    </div>
  );
};

export default CityClubList;
