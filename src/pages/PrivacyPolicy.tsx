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
        title="Privacy Policy - Cuddles"
        description="Learn about how Cuddles collects, uses, and protects your personal information in compliance with POPIA and data protection regulations."
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
              <p className="text-muted-foreground mt-1">Last updated: November 27, 2025</p>
            </div>
          </div>

          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-border/30">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Introduction</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Cuddles ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information in compliance with the Protection of Personal Information Act (POPIA) and other applicable data protection regulations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Information We Collect</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, and company details when you schedule a demo or contact us</li>
                  <li><strong>Chat Interactions:</strong> Conversations with our AI assistant, including preferences and questions about cannabis products</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited and features used</li>
                  <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">How We Use Your Information</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li>Provide, maintain, and improve our AI-powered recommendation services</li>
                  <li>Respond to your requests, questions, and provide customer support</li>
                  <li>Send you technical notices, updates, and administrative messages</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Comply with legal obligations and protect against fraudulent activity</li>
                  <li>With your consent, send you marketing communications about our services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Data Sharing and Disclosure</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Data Security</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Your Rights</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Under POPIA and other applicable laws, you have the right to:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal obligations</li>
                  <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                  <li><strong>Data Portability:</strong> Request transfer of your data to another service provider</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where consent was the basis</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Data Retention</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Keep Activity</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Your chats are saved in your account for up to 72 hours, whether Cuddles Apps Activity is on or off. We use this data to provide the service, maintain its safety and security, and process your feedback.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Cookies and Tracking Technologies</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookie settings through your browser preferences. Note that disabling cookies may limit your ability to use certain features of our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Children's Privacy</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Our services are not intended for individuals under the age of 18 (or the legal age for cannabis consumption in your jurisdiction). We do not knowingly collect personal information from children.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">International Data Transfers</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Changes to This Privacy Policy</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-foreground/80 mb-2"><strong>Cuddles</strong></p>
                  <p className="text-foreground/80 mb-2">Email: privacy@cuddles.ai</p>
                  <p className="text-foreground/80">Address: [Your Company Address]</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bubble font-bold text-foreground mb-4">Compliance with POPIA</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  This Privacy Policy has been drafted in accordance with the Protection of Personal Information Act (POPIA) 4 of 2013. If you believe we have not complied with POPIA, you have the right to lodge a complaint with the Information Regulator at:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-foreground/80 mb-2"><strong>Information Regulator (South Africa)</strong></p>
                  <p className="text-foreground/80 mb-2">Email: inforeg@justice.gov.za</p>
                  <p className="text-foreground/80">Website: www.justice.gov.za/inforeg</p>
                </div>
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
