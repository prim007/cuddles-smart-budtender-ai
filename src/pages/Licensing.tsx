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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-blue to-hippie-purple flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground">Licensing</h1>
                <p className="text-muted-foreground mt-1">Last updated: June 30, 2026</p>
              </div>
            </div>
            <Button onClick={generateInvestorPdf} variant="outline" className="gap-2 shrink-0">
              <Download className="w-4 h-4" />
              Download Investor Summary (PDF)
            </Button>
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
                  Premium (R99/month ZAR) and Pro (R27,750/month ZAR, ~$1,500 USD) subscriptions grant a personal or single-business licence to the additional features described at checkout, for the duration of the active subscription. Subscriptions may be cancelled at any time; licences end when the subscription period ends.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  <strong>Payment methods:</strong> We accept a range of South African and international payment options so you can pay the way that suits you best:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 leading-relaxed mb-4 space-y-1">
                  <li><strong>Stripe</strong> — international Visa, Mastercard, American Express &amp; Apple/Google Pay</li>
                  <li><strong>PayFast</strong> — South African cards, Instant EFT, Snapscan &amp; Zapper</li>
                  <li><strong>PayU</strong> — local cards and EFT for ZA customers</li>
                  <li><strong>Yoco</strong> — card payments for small ZA businesses</li>
                  <li><strong>Ozow</strong> — instant secure EFT directly from your bank</li>
                  <li><strong>EFT / Bank Transfer</strong> — manual invoicing for B2B and enterprise tiers</li>
                  <li><strong>Crypto (BTC / USDT)</strong> — available on request for international Pro customers</li>
                </ul>
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
                  Licensed dispensaries and brands rent Cuddles on a monthly, cancel-anytime licence. They receive a non-exclusive, non-transferable, tenant-scoped right to embed the Cuddles widget (widget.js), use issued tenant embed keys, and access related APIs for the purpose of serving their own customers. The licence is tied to the active B2B subscription and may not be sublicensed, resold, or used to build a competing budtender product.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-2">
                  <strong>Rental pricing</strong> (excluding VAT, 14-day free trial on every tier — same rates shown on our{" "}
                  <a href="/investment-deck" className="text-primary hover:underline">investment deck</a>):
                </p>
                <ul className="list-disc pl-6 text-foreground/80 leading-relaxed mb-4 space-y-1">
                  <li><strong>Starter — R1,899/month (~$100 USD):</strong> 1 location, embeddable widget, 1,000 AI chats per month</li>
                  <li><strong>Growth — R5,300/month (~$285 USD):</strong> up to 3 locations, POS sync, 5,000 AI chats per month</li>
                  <li><strong>Pro — R27,750/month (~$1,500 USD):</strong> unlimited locations, white-label, advanced analytics and API access</li>
                  <li><strong>Enterprise — custom:</strong> chains, resellers and white-label partners on annual contracts</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Tiers are benchmarked below the cost of one part-time budtender in South Africa (R6,000–R9,000/month). Overage on included chat volume is billed at R0.85 per additional chat, or the tenant may upgrade tiers at any time. Prices may be reviewed annually with 30 days' written notice; existing tenants keep their rate for the remainder of the paid period.
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
                  <a href="mailto:admin@cuddles-ai.com" className="text-primary hover:underline">
                    admin@cuddles-ai.com
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
