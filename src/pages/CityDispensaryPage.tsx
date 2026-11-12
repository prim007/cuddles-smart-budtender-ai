import { useParams, Link, Navigate } from "react-router-dom";
import { MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZA_CITIES, getZaCityBySlug } from "@/data/zaCities";
import Footer from "@/components/Footer";
import CityClubList from "@/components/CityClubList";

const CityDispensaryPage = () => {
  const { city } = useParams<{ city: string }>();
  const cityInfo = getZaCityBySlug(city);

  if (!cityInfo) return <Navigate to="/" replace />;

  const title = cityInfo.metaTitle ?? `Dispensary Near Me ${cityInfo.name} | Cuddles AI Budtender`;
  const description =
    cityInfo.metaDescription ??
    `Find legal cannabis dispensaries and clubs near you in ${cityInfo.name}, ${cityInfo.province}. Chat with Cuddles AI for instant strain matches and delivery options.`;
  const url = `/dispensary-near-me/${cityInfo.slug}`;


  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where can I find a dispensary near me in ${cityInfo.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${cityInfo.name} has private cannabis clubs and lounges rather than licensed shops. This page lists the ones in the DaggaSpot directory, closest to the city centre first, with map directions. Stock and membership rules vary, so call before you go.`,
        },
      },
      {
        "@type": "Question",
        "name": `Is cannabis legal in ${cityInfo.name}, ${cityInfo.province}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Personal-use cannabis is legal across South Africa following the Cannabis for Private Purposes Act. Buying remains regulated through private clubs and licensed medical channels.`,
        },
      },
      {
        "@type": "Question",
        "name": `Can I get cannabis delivered in ${cityInfo.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Selling cannabis is still not legal in South Africa, so delivery depends on each private club's own member rules. Some ${cityInfo.name} clubs deliver to members and others don't — call the club first to check.`,
        },
      },
    ],
  };

  const otherCities = ZA_CITIES.filter((c) => c.slug !== cityInfo.slug).slice(0, 6);

  const scrollToChat = () => {
    const chatSection = document.getElementById("chat-demo");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/?prompt=${encodeURIComponent(`dispensary near me in ${cityInfo.name}`)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={title}
        description={description}
        url={url}
        structuredData={structuredData}
        keywords={`weed dispensary ${cityInfo.name.toLowerCase()}, dispensary near me ${cityInfo.name.toLowerCase()}, cannabis club ${cityInfo.name.toLowerCase()}, weed delivery ${cityInfo.name.toLowerCase()}, buy cannabis ${cityInfo.name.toLowerCase()}, ${cityInfo.province} cannabis`}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-hippie-coral/10 via-background to-hippie-sage/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <MapPin className="h-3.5 w-3.5" /> {cityInfo.province}, South Africa
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            Dispensary near me in <span className="gradient-text">{cityInfo.name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {cityInfo.blurb} {cityInfo.slug === "durban"
              ? "Explore listed venues and plan your visit, with free educational help from Cuddles AI."
              : `Cuddles AI helps you explore cannabis dispensary, club and lounge listings in ${cityInfo.name}, with free strain education.`}
          </p>
          {cityInfo.localIntro && (
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">{cityInfo.localIntro}</p>
          )}


          <div className="mt-8 flex flex-wrap gap-3">
            {cityInfo.slug === "durban" && (
              <Button size="lg" asChild className="gap-2">
                <a href="#clubs"><MapPin className="h-4 w-4" /> View Durban listings</a>
              </Button>
            )}
            <Button size="lg" onClick={scrollToChat} className="gap-2 bg-gradient-to-r from-hippie-coral to-hippie-pink text-white">
              <MessageCircle className="h-4 w-4" /> Ask Cuddles where to go
            </Button>
            <Link to="/shop">
              <Button size="lg" variant="outline" className="gap-2">
                Browse strains
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why use Cuddles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Find the right spot in {cityInfo.name} — without the guesswork
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: MapPin, title: "Closest first", text: `The list below shows ${cityInfo.name} clubs with distances and directions.` },
              { icon: Sparkles, title: "Know what to ask for", text: "Cuddles explains which strains and terpenes suit the effect you want, in plain language." },
              { icon: ShieldCheck, title: "Straight answers on the law", text: "Cuddles explains South Africa's private-use rules so you know where you stand." },
            ].map((b) => (
              <Card key={b.title} className="p-5">
                <b.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live club list */}
      <section id="clubs" className="py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Cannabis clubs listed in {cityInfo.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Closest to the city centre first, with map directions. Selling cannabis is still not legal in South Africa, so being listed here doesn't mean a place is licensed.
          </p>
          <CityClubList cityName={cityInfo.name} lat={cityInfo.lat} lng={cityInfo.lng} />
          {cityInfo.nextSteps && (
            <div className="mt-8">
              <h3 className="font-display text-lg font-semibold text-foreground">Before you go</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                {cityInfo.nextSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          {cityInfo.slug === "durban" && (
            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>Directory names and location labels come from DaggaSpot. Names containing “medical” or “dispensary” are venue labels, not a Cuddles endorsement or verification.</p>
              <p>
                Read our <Link to="/blog/gauteng-cannabis-shop-raids-police-memo-october-2026" className="text-primary underline">South African cannabis retail law explainer</Link> before making assumptions about a club's sales or membership model. Private adult use does not automatically authorise retail sales.
              </p>
              <p>
                Run a Durban venue or spotted an incorrect listing? <Link to="/partners" className="text-primary underline">Contact Cuddles through the partners page</Link> with the venue name and corrected details.
              </p>
            </div>
          )}
        </div>
      </section>



      {/* FAQ */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {structuredData.mainEntity.map((q) => (
              <Card key={q.name} className="p-5">
                <h3 className="font-semibold text-foreground">{q.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{q.acceptedAnswer.text}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={scrollToChat} className="gap-2">
              <MessageCircle className="h-4 w-4" /> Chat with Cuddles
            </Button>
            <a href="tel:+27645436734" className="inline-flex">
              <Button variant="outline" className="gap-2"><Phone className="h-4 w-4" /> Prefer to call?</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Other cities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Other South African cities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherCities.map((c) => (
              <Link key={c.slug} to={`/dispensary-near-me/${c.slug}`} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
                Dispensary near me {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CityDispensaryPage;
