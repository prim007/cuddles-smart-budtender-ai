import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOURCE_URL = "https://api.daggaspot.co.za/organizations/locations?wl=cannamapza";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h

interface Spot {
  organization_id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  province: string | null;
  country_code: string | null;
  phone: string | null;
  phone2: string | null;
  currently_open: boolean | null;
  hours_known: boolean | null;
  average_rating: number | null;
  rating_count: number | null;
  social_links?: { url?: string }[];
  online_url?: string | null;
  location_type?: string | null;
  profile_tags?: { label: string }[];
}

let cache: { at: number; spots: Spot[] } | null = null;

async function loadSpots(): Promise<Spot[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.spots;
  const res = await fetch(SOURCE_URL, { headers: { accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    console.error(`daggaspot source failed [${res.status}]: ${body.slice(0, 500)}`);
    if (cache) return cache.spots; // serve stale rather than fail
    throw new Error(`Source request failed (${res.status})`);
  }
  const spots = (await res.json()) as Spot[];
  cache = { at: Date.now(), spots };
  return spots;
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function norm(s: unknown): string {
  return String(s ?? "").toLowerCase().trim();
}

function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" && typeof lng === "number" &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  );
}

function shape(s: Spot, distanceKm: number | null) {
  const website = s.online_url || s.social_links?.find((l) => l?.url)?.url || null;
  const mapsUrl = isValidCoordinate(s.latitude, s.longitude)
    ? `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${s.name} ${s.city ?? ""} ${s.province ?? ""}`,
      )}`;
  return {
    id: s.organization_id,
    name: s.name,
    address: [s.city, s.province, s.country_code].filter(Boolean).join(", "),
    lat: s.latitude,
    lng: s.longitude,
    distance_km: distanceKm != null ? +distanceKm.toFixed(2) : null,
    rating: s.average_rating ?? null,
    rating_count: s.rating_count ?? null,
    open_now: s.hours_known ? (s.currently_open ?? null) : null,
    phone: s.phone || s.phone2 || null,
    website,
    maps_url: mapsUrl,
    tags: (s.profile_tags || []).map((t) => t.label).slice(0, 4),
    source: "daggaspot",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const rl = rateLimitResponse(
    req,
    { scope: "daggaspot-dispensaries", max: 30, windowMs: 60_000 },
    corsHeaders,
  );
  if (rl) return rl;

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const lat = body.lat;
    const lng = body.lng;
    const place = norm(body.address).slice(0, 120);
    const country = norm(body.country) || "za";
    const limit = Math.min(Math.max(Number(body.limit) || 5, 1), 20);

    const all = await loadSpots();
    let pool = all.filter(
      (s) => !country || norm(s.country_code) === country,
    );

    let results;
    if (isValidCoordinate(lat, lng)) {
      const origin = { lat: lat as number, lng: lng as number };
      results = pool
        .filter((s) => isValidCoordinate(s.latitude, s.longitude))
        .map((s) => ({
          s,
          d: haversineKm(origin, { lat: s.latitude!, lng: s.longitude! }),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, limit)
        .map(({ s, d }) => shape(s, d));
    } else if (place) {
      const tokens = place.split(/[\s,]+/).filter((t) => t.length > 2);
      const scored = pool
        .map((s) => {
          const hay = `${norm(s.city)} ${norm(s.province)} ${norm(s.name)}`;
          const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0)
            + (norm(s.city) === place ? 2 : 0);
          return { s, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score || (b.s.average_rating ?? 0) - (a.s.average_rating ?? 0))
        .slice(0, limit);
      results = scored.map(({ s }) => shape(s, null));
    } else {
      results = pool.slice(0, limit).map((s) => shape(s, null));
    }

    return new Response(
      JSON.stringify({
        dispensaries: results,
        total_indexed: pool.length,
        attribution: { name: "DaggaSpot", url: "https://daggaspot.co.za" },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("daggaspot-dispensaries error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to retrieve dispensary data. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
