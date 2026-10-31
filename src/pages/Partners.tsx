import { useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Handshake, MapPin, ShoppingBag } from "lucide-react";

const WIDGET_SRC = "https://daggaspot.co.za/assets/widget/widget.js";

export default function Partners() {
  useEffect(() => {
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.setAttribute("data-api", "https://api.daggaspot.co.za");
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Partners | Cuddles AI"
        description="Cuddles AI partners and listings, including our verified CannaMap listing on DaggaSpot and the Tripple Four Shop hub."
        url="/partners"
      />

      <main className="container mx-auto max-w-3xl px-4 py-16">
        <div className="mb-12 text-center">
          <Handshake className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Partners</h1>
          <p className="text-muted-foreground">
            Cuddles AI works with South African platforms and retailers to keep plant and cannabis
            education accurate, local, and useful. General education only — not medical advice.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <MapPin className="h-5 w-5 text-primary" /> CannaMap on DaggaSpot
          </h2>
          <Card className="space-y-4 p-6 text-sm leading-relaxed">
            <p>
              We're listed on DaggaSpot's CannaMap directory. The verified badge below is served
              directly by DaggaSpot.
            </p>
            <div className="flex justify-center py-2">
              {/* @ts-expect-error custom element provided by the DaggaSpot widget */}
              <cannamap-badge
                data-org-id="507bec94-ff41-4f59-aaf5-c0d429249a38"
                data-size="medium"
                data-theme="light"
              />
            </div>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <ShoppingBag className="h-5 w-5 text-primary" /> Tripple Four Shop
          </h2>
          <Card className="space-y-3 p-6 text-sm leading-relaxed">
            <p>
              Our retail hub for products Cuddles references in conversation. Browse the catalogue at{" "}
              <a
                href="https://tripplefourshophub.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                tripplefourshophub.online
              </a>
              .
            </p>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Partner with us</h2>
          <Card className="space-y-3 p-6 text-sm leading-relaxed">
            <p>
              Dispensaries and grow retailers can add Cuddles to their own site with our embeddable
              budtender widget.
            </p>
            <Link to="/schedule-demo" className="inline-block text-primary underline underline-offset-4">
              Schedule a demo
            </Link>
            <p className="pt-2">
              Want your shop's story told? We write free features about South African plant and cannabis
              businesses for the Cuddles blog.
            </p>
            <Link to="/share-your-story" className="inline-block text-primary underline underline-offset-4">
              Tell us your story
            </Link>
          </Card>
        </section>
      </main>
    </div>
  );
}
