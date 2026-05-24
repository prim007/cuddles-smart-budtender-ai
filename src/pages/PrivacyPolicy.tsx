import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Privacy Policy - Cuddles AI"
        description="How Cuddles AI collects, uses, stores, and protects your personal information in compliance with POPIA, GDPR principles, and applicable data protection laws."
        url="/privacy-policy"
      />
      
      {/* Header */}
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

      {/* Main Content */}
      <main className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hippie-blue to-hippie-purple flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground mt-1">Last updated: May 14, 2026</p>
            </div>
          </div>

          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-border/30">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Cuddles AI ("Cuddles", "we", "our", or "us"), a product of Tripple444, is committed to protecting your privacy and the security of your personal information. This Privacy Policy explains how we collect, use, disclose, store, and safeguard your information when you use the Cuddles AI website, mobile applications, embeddable widgets, and related services (collectively, the "Services").
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  This Policy is drafted to comply with the Protection of Personal Information Act, 2013 (POPIA) of South Africa, and reflects globally recognised principles drawn from the GDPR, the UK Data Protection Act, and other applicable data protection regulations. By using the Services, you acknowledge that you have read and understood this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">2. Who We Are (Responsible Party)</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  For the purposes of POPIA, the Responsible Party is <strong>Tripple444</strong>, operating the Cuddles AI platform. All privacy enquiries, data subject requests, and complaints can be directed to our Information Officer at the contact details set out in Section 14.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">3. Information We Collect</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We collect only the information necessary to deliver and improve the Services:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li><strong>Account Information:</strong> Name, email address, password (hashed), and optional profile details when you sign up.</li>
                  <li><strong>Dispensary / Business Information:</strong> Business name, contact person, store details, POS provider, and billing information when you onboard as a B2B customer.</li>
                  <li><strong>Chat Interactions:</strong> Messages exchanged with the Cuddles AI assistant, including stated preferences, questions, and uploaded images for strain identification.</li>
                  <li><strong>Transactional Data:</strong> Orders, delivery addresses, and payment confirmations processed via PayFast (we do not store card numbers).</li>
                  <li><strong>Usage Data:</strong> Pages visited, features used, time on page, click events, and referrer information.</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, operating system, device identifiers, and cookies.</li>
                  <li><strong>Communications:</strong> Records of correspondence when you contact support, schedule a demo, or submit a form.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">4. Lawful Basis for Processing</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We process your personal information only where we have a lawful basis to do so, including:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li><strong>Consent</strong> — where you have actively opted in (e.g. marketing emails, optional features).</li>
                  <li><strong>Contractual necessity</strong> — to deliver the Services you have requested.</li>
                  <li><strong>Legal obligation</strong> — to comply with applicable laws and regulations.</li>
                  <li><strong>Legitimate interest</strong> — to operate, secure, and improve the Services in a manner you would reasonably expect.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">5. How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li>Provide, maintain, personalise, and improve the AI-powered recommendation Services.</li>
                  <li>Authenticate users and secure accounts.</li>
                  <li>Process transactions, deliveries, and subscription billing.</li>
                  <li>Respond to support requests and provide customer service.</li>
                  <li>Send service-related notices, security alerts, and administrative messages.</li>
                  <li>Analyse usage patterns to enhance product quality and user experience.</li>
                  <li>Detect, prevent, and address fraud, abuse, or violations of our Terms.</li>
                  <li>Comply with legal, regulatory, and tax obligations.</li>
                  <li>With your consent, send marketing communications which you can unsubscribe from at any time.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">6. Data Sharing and Disclosure</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  <strong>We do not sell your personal information.</strong> We may share information only with:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li><strong>Service Providers:</strong> Vetted vendors providing hosting, database, analytics, email delivery, AI inference, and payment processing under written data-protection agreements.</li>
                  <li><strong>Dispensary Partners:</strong> If you place an order through a partner dispensary widget, the order details necessary to fulfil that order are shared with that dispensary.</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect rights, property, or safety.</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, financing, or sale of assets, with continued protection of your information.</li>
                  <li><strong>With Your Consent:</strong> Any other sharing only with your explicit authorisation.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">7. Data Security</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We implement appropriate, reasonable technical and organisational measures to protect personal information from loss, misuse, unauthorised access, disclosure, alteration, or destruction. These include:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li>TLS encryption of data in transit and AES encryption of data at rest.</li>
                  <li>Row-Level Security (RLS) and role-based access control on our database.</li>
                  <li>Hashed passwords, JWT-based session management, and rate limiting.</li>
                  <li>Periodic security reviews, dependency scanning, and incident response procedures.</li>
                  <li>Confidentiality obligations for all personnel and processors with access to data.</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  In the event of a personal information breach that creates a risk of harm, we will notify the Information Regulator and affected data subjects as required by POPIA.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">8. Your Rights</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Subject to applicable law, you have the right to:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li><strong>Access</strong> the personal information we hold about you.</li>
                  <li><strong>Correct</strong> inaccurate or incomplete information.</li>
                  <li><strong>Delete</strong> your personal information, subject to overriding legal obligations.</li>
                  <li><strong>Object</strong> to processing for direct marketing or based on legitimate interest.</li>
                  <li><strong>Restrict</strong> processing in certain circumstances.</li>
                  <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
                  <li><strong>Withdraw consent</strong> at any time where processing is based on consent.</li>
                  <li><strong>Lodge a complaint</strong> with the Information Regulator (see Section 15).</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  To exercise any of these rights, email <a href="mailto:tripple4442@gmail.com" className="text-primary underline">tripple4442@gmail.com</a>. We will respond within a reasonable period and within statutory timeframes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">9. Data Retention</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We retain personal information only for as long as necessary to fulfil the purposes outlined in this Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Chat conversations are retained in your account for up to 72 hours unless you save them. Account data is retained for the lifetime of your account plus a reasonable period after closure for legal and audit purposes, after which it is securely deleted or anonymised.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">10. Cookies and Tracking Technologies</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We use cookies and similar technologies (such as local storage and analytics pixels) to operate the Services, remember preferences, measure performance, and understand usage. You can control cookies through your browser settings. Disabling cookies may limit certain features. We use Google Analytics to understand aggregate usage; you can opt out via Google's tools.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">11. Children's Privacy</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The Services are strictly intended for adults aged 18 or older (or the legal age of cannabis consumption in your jurisdiction, whichever is higher). We do not knowingly collect personal information from minors. If we learn we have collected information from a minor, we will delete it promptly. If you believe a minor has provided us with information, contact <a href="mailto:tripple4442@gmail.com" className="text-primary underline">tripple4442@gmail.com</a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">12. International Data Transfers</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Your information may be transferred to, stored, and processed in countries outside your country of residence, including jurisdictions where our hosting and AI providers operate. Where such transfers occur, we ensure appropriate safeguards (such as standard contractual clauses or equivalent protections) are in place in line with POPIA's cross-border transfer requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">13. Changes to This Privacy Policy</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Material changes will be communicated via email or in-app notice and the "Last updated" date will be revised. Continued use of the Services after changes take effect constitutes acceptance of the revised Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">14. Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  For any questions, concerns, requests, or to exercise your rights under this Policy, contact our Information Officer:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-foreground/80 mb-2"><strong>Cuddles AI — a Tripple444 product</strong></p>
                  <p className="text-foreground/80 mb-2">Email: <a href="mailto:tripple4442@gmail.com" className="text-primary underline">tripple4442@gmail.com</a></p>
                  <p className="text-foreground/80">Website: <a href="https://cuddles-ai.com" className="text-primary underline">https://cuddles-ai.com</a></p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">15. Compliance with POPIA</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  This Privacy Policy is drafted in accordance with the Protection of Personal Information Act, 4 of 2013 (POPIA). If you believe we have not complied with POPIA, you may lodge a complaint with the Information Regulator:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-foreground/80 mb-2"><strong>Information Regulator (South Africa)</strong></p>
                  <p className="text-foreground/80 mb-2">Email: <a href="mailto:inforeg@justice.gov.za" className="text-primary underline">inforeg@justice.gov.za</a></p>
                  <p className="text-foreground/80 mb-2">Complaints: <a href="mailto:complaints.IR@justice.gov.za" className="text-primary underline">complaints.IR@justice.gov.za</a></p>
                  <p className="text-foreground/80">Website: <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-primary underline">inforegulator.org.za</a></p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">16. Licensed Supplier Verification</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  All cannabis and cannabis-derived products listed in the Tripple444 online marketplace are sourced exclusively from facilities that hold valid licences issued by the South African Health Products Regulatory Authority (SAHPRA) and/or the Department of Health, in accordance with the Medicines and Related Substances Act, 101 of 1965, and applicable cannabis regulations.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We maintain an internal <strong>Licensed Facilities Database</strong>, compiled and continuously updated by manually ingesting SAHPRA's published lists of licensed medicinal cannabis cultivators, manufacturers, importers, and exporters. Before any supplier is onboarded to the Tripple444 marketplace, we cross-check their company name, licence number, and licence status against this database to confirm legal compliance. Suppliers whose licences lapse, are suspended, or are revoked are removed from the marketplace.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  This verification process is designed to protect consumers from unregulated or illicit products and to support South Africa's lawful cannabis economy. Users may request confirmation of a specific supplier's licensed status by contacting <a href="mailto:tripple4442@gmail.com" className="text-primary underline">tripple4442@gmail.com</a>. SAHPRA's official licensing information is publicly available at <a href="https://www.sahpra.org.za" target="_blank" rel="noopener noreferrer" className="text-primary underline">sahpra.org.za</a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">17. Disclaimer</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Cuddles AI provides general cannabis education and product discovery only. Nothing on the Services constitutes medical advice. Always consult a qualified healthcare practitioner before making decisions based on cannabis information. Use of cannabis is subject to the laws of your jurisdiction; you are responsible for compliance.
                </p>
              </section>

            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
