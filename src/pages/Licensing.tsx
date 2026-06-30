import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Mail, Download } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { generateInvestorPdf } from "@/lib/generateInvestorPdf";

const Licensing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Licensing - Cuddles AI"
        description="Licensing terms for Cuddles AI: how dispensaries, developers, and partners can license the Cuddles AI smart budtender, embeddable widget, and APIs."
        url="/licensing"
      />

      <header className="border-b border-border py-6">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-blue to-hippie-purple flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">Licensing</h1>
              <p className="text-muted-foreground mt-1">Last updated: June 30, 2026</p>
            </div>
          </div>

          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-border/30">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">1. Overview</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Cuddles AI is a product of Tripple444. All software, trademarks, content, brand assets, models, prompts, datasets, and the embeddable widget (collectively, the "Cuddles Platform") are owned by Tripple444 and are made available under the licence terms below. By accessing or using the Cuddles Platform you agree to these terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">2. Consumer Use (Free Tier)</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Individual users are granted a personal, non-exclusive, non-transferable, revocable licence to use the Cuddles AI consumer app, chat, journal, scanner, and reviews features for personal, non-commercial cannabis education and lifestyle purposes. Output from Cuddles is for general information only and is not medical, legal, or professional advice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">3. Premium &amp; Pro Subscriptions</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Premium (R99/month ZAR) and Pro (R27,750/month ZAR, ~$1,500 USD) subscriptions grant a personal or single-business licence to the additional features described at checkout, for the duration of the active subscription. Subscriptions are billed via Stripe and may be cancelled at any time; licences end when the subscription period ends.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  See what the Pro tier unlocks — advanced analytics, multi-location support, and white-label options — on our{" "}
                  <a
                    href="https://www.youtube.com/@CuddlesAI-Budtender"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    YouTube channel
                  </a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">4. Dispensary &amp; B2B Licence (Embeddable Widget &amp; API)</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Licensed dispensaries and brands receive a non-exclusive, non-transferable, tenant-scoped licence to embed the Cuddles widget (widget.js), use issued tenant embed keys, and access related APIs for the purpose of serving their own customers. The licence is tied to the active B2B subscription and may not be sublicensed, resold, or used to build a competing budtender product.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Embed keys are confidential. Tenants are responsible for their own catalog data, compliance with local cannabis laws, and any claims made to their customers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">5. Trademarks &amp; Brand</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  "Cuddles", "Cuddles AI", "Tripple444", the Cuddles logo, and the sunset visual identity are trademarks of Tripple444. You may not use these marks without prior written permission, except for factual, accurate references to the Cuddles Platform (e.g. "Powered by Cuddles AI" when displayed by a licensed tenant).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">6. Restrictions</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Unless expressly permitted in writing, you may not: (a) copy, modify, reverse engineer, or create derivative works of the Cuddles Platform; (b) scrape, harvest, or bulk-export content, strain data, or model outputs; (c) use Cuddles outputs to train competing AI models; (d) remove proprietary notices; or (e) use the Platform in violation of applicable law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">7. Third-Party &amp; Open-Source Components</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The Cuddles Platform incorporates open-source libraries (including React, Vite, Tailwind CSS, shadcn/ui, and others) under their respective licences. Those licences apply only to the relevant components and do not grant rights to the Cuddles Platform as a whole.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">8. Disclaimer</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The Cuddles Platform is provided "as is" without warranties of any kind. Cuddles provides general cannabis education only and does not provide medical advice. To the maximum extent permitted by law, Tripple444 disclaims all implied warranties and is not liable for indirect or consequential damages arising from use of the Platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">9. Termination</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We may suspend or terminate any licence granted under these terms if a user or tenant breaches them, fails to pay applicable fees, or misuses the Platform. On termination, all rights to access and use the Cuddles Platform end immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">10. Contact &amp; Custom Licensing</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  For enterprise, white-label, reseller, or media-use licences, contact Tripple444:
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:tripple4442@gmail.com" className="text-primary hover:underline">
                    tripple4442@gmail.com
                  </a>
                </p>
                <Link to="/schedule-demo">
                  <Button className="mt-2">Request a licensing call</Button>
                </Link>
              </section>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Licensing;
