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
  /** Optional practical next steps shown under the club list. */
  nextSteps?: string[];
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
    blurb:
      "Home of the legendary Durban Poison landrace, with private cannabis clubs and same-day delivery from Umhlanga and the Berea through Westville, Pinetown and the Bluff.",
    metaTitle: "Weed Dispensary Near Me Durban — Open Now, Same-Day Delivery",
    metaDescription:
      "Find weed dispensaries and cannabis clubs open near you in Durban — Umhlanga, Berea, Westville, the Bluff. Free AI strain matching, live stock and same-day delivery in minutes.",
    localIntro:
      "Durban's scene runs on private members' clubs rather than open shopfronts, so the closest option depends on the suburb you're in. Tell Cuddles where you are — Umhlanga, Berea, Glenwood, Musgrave, Westville, Pinetown, Chatsworth or the Bluff — and it will point you at the nearest clubs, who delivers the same day, and which local strains (Durban Poison included) suit what you're after. Membership sign-up is usually quick and done at the club or online, and many clubs keep menus updated daily, so it's worth asking what's in stock before you head out. If you're new to the scene, ask Cuddles to explain how private clubs work, what ID you'll need, and which strains suit the effect you want.",
  },

  { slug: "pretoria", name: "Pretoria", province: "Gauteng", lat: -25.7479, lng: 28.2293, blurb: "Capital city with a fast-growing legal cannabis lounge scene." },
  { slug: "port-elizabeth", name: "Port Elizabeth", province: "Eastern Cape", lat: -33.9608, lng: 25.6022, blurb: "Friendly coastal city with several established dispensaries." },
  {
    slug: "bloemfontein",
    name: "Bloemfontein",
    province: "Free State",
    lat: -29.0852,
    lng: 26.1596,
    blurb: "The Free State's capital, with a small, tight-knit private cannabis club scene.",
    metaTitle: "Dispensary Near Me Bloemfontein | Clubs Listed With Directions",
    metaDescription:
      "See cannabis clubs and lounges listed in Bloemfontein, from the city centre to Heuwelsig, with distances and map directions. What to check before you go, plus free strain help.",
    localIntro:
      "Bloemfontein has no licensed cannabis shops — selling cannabis is still not legal in South Africa, so places run as private members' clubs and lounges. Most listed clubs sit within about 5 km of the city centre, with others towards Heuwelsig and the eastern suburbs. Scroll down for the current list with distances and map directions, then ask Cuddles which strains suit the effect you want so you know what to ask for.",
    nextSteps: [
      "Pick a club from the list and tap Directions to see how far it is from where you are.",
      "Call first. Opening hours, stock and whether they take new members change often, and Cuddles doesn't check them.",
      "Expect to sign up as a member and show ID that proves you're 18 or older.",
      "Ask Cuddles in the chat which strains suit the effect you want, so you know what to ask for.",
      "Run a club in Bloemfontein that isn't listed? Get in touch through our partners page.",
    ],
  },
  { slug: "east-london", name: "East London", province: "Eastern Cape", lat: -33.0153, lng: 27.9116, blurb: "Coastal city serving the Eastern Cape's growing legal market." },
  { slug: "polokwane", name: "Polokwane", province: "Limpopo", lat: -23.9045, lng: 29.4689, blurb: "Limpopo's largest city, gateway to northern South Africa." },
  { slug: "nelspruit", name: "Nelspruit", province: "Mpumalanga", lat: -25.4753, lng: 30.9694, blurb: "Mpumalanga's commercial hub near the Mozambique border." },
  { slug: "kimberley", name: "Kimberley", province: "Northern Cape", lat: -28.7282, lng: 24.7499, blurb: "Northern Cape's diamond city with a small but loyal cannabis scene." },
  { slug: "pietermaritzburg", name: "Pietermaritzburg", province: "KwaZulu-Natal", lat: -29.6006, lng: 30.3794, blurb: "KZN's capital, just an hour inland from Durban." },
  { slug: "stellenbosch", name: "Stellenbosch", province: "Western Cape", lat: -33.9321, lng: 18.8602, blurb: "University town near Cape Town with a craft-cannabis sensibility." },
];

export const getZaCityBySlug = (slug: string | undefined): ZaCity | undefined =>
  ZA_CITIES.find((c) => c.slug === slug?.toLowerCase());
