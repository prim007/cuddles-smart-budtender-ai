import { MapPin, Star, Phone, Navigation, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/components/GoogleAnalytics";

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  distance_km: number | null;
  rating: number | null;
  rating_count: number | null;
  open_now: boolean | null;
  phone: string | null;
  website: string | null;
  maps_url: string;
}

interface Props {
  dispensaries: Dispensary[];
}

const ChatDispensaryCards = ({ dispensaries }: Props) => {
  if (!dispensaries?.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {dispensaries.map((d, idx) => (
        <div
          key={d.id}
          className="rounded-xl border border-border bg-card/80 p-3 shadow-soft backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-hippie-coral to-hippie-amber text-[10px] font-bold text-white">
                  {idx + 1}
                </span>
                <h4 className="truncate font-display font-semibold text-foreground">
                  {d.name}
                </h4>
              </div>
              <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="line-clamp-2">{d.address}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                {d.distance_km != null && (
                  <span className="font-medium text-foreground">
                    {d.distance_km < 1
                      ? `${Math.round(d.distance_km * 1000)} m`
                      : `${d.distance_km} km`}
                  </span>
                )}
                {d.rating != null && (
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-hippie-amber text-hippie-amber" />
                    <span className="font-medium">{d.rating.toFixed(1)}</span>
                    {d.rating_count != null && (
                      <span className="text-muted-foreground">({d.rating_count})</span>
                    )}
                  </span>
                )}
                {d.open_now != null && (
                  <Badge
                    variant={d.open_now ? "default" : "secondary"}
                    className={`gap-1 ${d.open_now ? "bg-hippie-sage text-white" : ""}`}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {d.open_now ? "Open" : "Closed"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {d.phone && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  trackEvent("dispensary_call", "conversion", d.name);
                  window.location.href = `tel:${d.phone}`;
                }}
              >
                <Phone className="h-3 w-3" />
                Call
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                trackEvent("dispensary_directions", "conversion", d.name);
                window.open(d.maps_url, "_blank", "noopener,noreferrer");
              }}
            >
              <Navigation className="h-3 w-3" />
              Directions
            </Button>
            {d.website && (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-gradient-to-r from-hippie-coral to-hippie-peach text-xs text-white"
                onClick={() => {
                  trackEvent("dispensary_visit", "conversion", d.name);
                  window.open(d.website!, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="h-3 w-3" />
                Visit
              </Button>
            )}
          </div>
        </div>
      ))}
      <p className="px-1 text-[10px] text-muted-foreground">
        🪪 Most dispensaries require 18+ with valid ID. Menus vary — check before visiting. Not medical advice.
      </p>
    </div>
  );
};

export default ChatDispensaryCards;
