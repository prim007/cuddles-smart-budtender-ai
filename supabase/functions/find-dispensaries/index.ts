import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { rateLimitResponse } from "../_shared/rate-limit.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

interface ReqBody {
  lat?: number;
  lng?: number;
  address?: string;
  query?: string;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY!,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const loc = data?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps connector not configured");
    }

    const body = (await req.json()) as ReqBody;
    let { lat, lng } = body;

    if ((lat == null || lng == null) && body.address) {
      const geo = await geocodeAddress(body.address.slice(0, 200));
      if (!geo) {
        return new Response(
          JSON.stringify({ error: "Could not find that location. Try a city and country." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      lat = geo.lat;
      lng = geo.lng;
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(
        JSON.stringify({ error: "Provide either lat/lng or an address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const textQuery = (body.query || "cannabis dispensary").slice(0, 80);

    const placesRes = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus",
      },
      body: JSON.stringify({
        textQuery,
        locationBias: {
          circle: { center: { latitude: lat, longitude: lng }, radius: 25000 },
        },
        maxResultCount: 10,
      }),
    });

    if (!placesRes.ok) {
      const errText = await placesRes.text();
      console.error("Places API error", placesRes.status, errText);
      throw new Error(`Places API failed (${placesRes.status})`);
    }

    const placesData = await placesRes.json();
    const origin = { lat, lng };

    const dispensaries = (placesData.places || [])
      .filter((p: any) => p.businessStatus !== "CLOSED_PERMANENTLY")
      .map((p: any) => ({
        id: p.id,
        name: p.displayName?.text || "Unnamed",
        address: p.formattedAddress || "",
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        distance_km:
          p.location?.latitude && p.location?.longitude
            ? +haversineKm(origin, { lat: p.location.latitude, lng: p.location.longitude }).toFixed(2)
            : null,
        rating: p.rating ?? null,
        rating_count: p.userRatingCount ?? null,
        open_now: p.currentOpeningHours?.openNow ?? null,
        phone: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
        website: p.websiteUri || null,
        maps_url:
          p.googleMapsUri ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            p.displayName?.text + " " + (p.formattedAddress || "")
          )}`,
      }))
      .sort((a: any, b: any) => (a.distance_km ?? 9e9) - (b.distance_km ?? 9e9))
      .slice(0, 5);

    return new Response(
      JSON.stringify({ origin, dispensaries }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("find-dispensaries error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
