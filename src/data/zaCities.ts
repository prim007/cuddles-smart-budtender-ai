/**
 * South African cities used for programmatic SEO city pages
 * served at /dispensary-near-me/:city
 */
export interface ZaCity {
  slug: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  blurb: string;
  /** Optional overrides for search/social metadata on high-intent city pages. */
  metaTitle?: string;
  metaDescription?: string;
  /** Optional extra paragraph shown under the hero for local search intent. */
  localIntro?: string;
}

export const ZA_CITIES: ZaCity[] = [
  { slug: "johannesburg", name: "Johannesburg", province: "Gauteng", lat: -26.2041, lng: 28.0473, blurb: "South Africa's biggest metro and the country's busiest cannabis market." },
  { slug: "cape-town", name: "Cape Town", province: "Western Cape", lat: -33.9249, lng: 18.4241, blurb: "Home to some of South Africa's most innovative private cannabis clubs." },
  {
    slug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    lat: -29.8587,
    lng: 31.0218,
    blurb: "Home of the legendary Durban Poison landrace, with private clubs from the Berea and Glenwood through to Umhlanga and the Bluff.",
    metaTitle: "Cannabis Clubs & Weed Delivery in Durban — Open Near You Today",
    metaDescription: "Find private cannabis clubs and same-day weed delivery in Durban, from Umhlanga and Berea to the Bluff. Ask Cuddles AI what's open near you and which strain fits.",
    localIntro:
      "Durban's scene runs on private members' clubs rather than open shopfronts, so the closest option depends on the suburb you're in. Tell Cuddles where you are — Umhlanga, Berea, Glenwood, Musgrave, Westville, Pinetown, Chatsworth or the Bluff — and it will point you at the nearest clubs, who delivers the same day, and which local strains (Durban Poison included) suit what you're after.",
  },

  { slug: "pretoria", name: "Pretoria", province: "Gauteng", lat: -25.7479, lng: 28.2293, blurb: "Capital city with a fast-growing legal cannabis lounge scene." },
  { slug: "port-elizabeth", name: "Port Elizabeth", province: "Eastern Cape", lat: -33.9608, lng: 25.6022, blurb: "Friendly coastal city with several established dispensaries." },
  { slug: "bloemfontein", name: "Bloemfontein", province: "Free State", lat: -29.0852, lng: 26.1596, blurb: "Central-South Africa hub with a tight-knit cannabis community." },
  { slug: "east-london", name: "East London", province: "Eastern Cape", lat: -33.0153, lng: 27.9116, blurb: "Coastal city serving the Eastern Cape's growing legal market." },
  { slug: "polokwane", name: "Polokwane", province: "Limpopo", lat: -23.9045, lng: 29.4689, blurb: "Limpopo's largest city, gateway to northern South Africa." },
  { slug: "nelspruit", name: "Nelspruit", province: "Mpumalanga", lat: -25.4753, lng: 30.9694, blurb: "Mpumalanga's commercial hub near the Mozambique border." },
  { slug: "kimberley", name: "Kimberley", province: "Northern Cape", lat: -28.7282, lng: 24.7499, blurb: "Northern Cape's diamond city with a small but loyal cannabis scene." },
  { slug: "pietermaritzburg", name: "Pietermaritzburg", province: "KwaZulu-Natal", lat: -29.6006, lng: 30.3794, blurb: "KZN's capital, just an hour inland from Durban." },
  { slug: "stellenbosch", name: "Stellenbosch", province: "Western Cape", lat: -33.9321, lng: 18.8602, blurb: "University town near Cape Town with a craft-cannabis sensibility." },
];

export const getZaCityBySlug = (slug: string | undefined): ZaCity | undefined =>
  ZA_CITIES.find((c) => c.slug === slug?.toLowerCase());
