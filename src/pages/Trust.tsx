import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Database, Mail, FileText } from "lucide-react";

export default function Trust() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Trust & Security | Cuddles AI"
        description="Security practices and data handling for Cuddles AI. POPIA-aligned, encrypted in transit and at rest."
        url="/trust"
      />

      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Trust & Security</h1>
          <p className="text-muted-foreground">
            This page is maintained by Tripple444 (Pty) Ltd to answer common security and privacy
            questions about Cuddles AI. It describes current practices — it is not a third-party
            certification.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <Lock className="h-5 w-5 text-primary" /> Security controls
          </h2>
          <Card className="space-y-3 p-6 text-sm leading-relaxed">
            <p>• All traffic is served over HTTPS (TLS 1.2+).</p>
            <p>• Database storage is encrypted at rest by our hosting provider.</p>
            <p>• Row-Level Security policies gate every user-facing table.</p>
            <p>• Role-based access control (RBAC) restricts admin functionality.</p>
            <p>• Leaked-password protection (HIBP) is enabled on sign-up and password change.</p>
            <p>• Edge functions enforce per-IP and per-session rate limits.</p>
            <p>• Secrets are stored in a managed secret store and never committed to source.</p>
            <p>• Code changes are reviewed via Git history and deployed through an automated pipeline.</p>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <Database className="h-5 w-5 text-primary" /> Data we collect
          </h2>
          <Card className="space-y-3 p-6 text-sm leading-relaxed">
            <p>
              We collect the minimum needed to run Cuddles: account email, profile preferences,
              chat history with the AI budtender, and (if you opt in) location for dispensary
              suggestions. To improve Cuddles, anonymised questions and answers from chats (with
              emails, phone numbers, links and names removed) may be added to our knowledge
              library. We don't fine-tune AI models on your chats.
              We do not sell personal data.
            </p>
            <p>
              Full details are in our{" "}
              <Link to="/privacy-policy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </p>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <FileText className="h-5 w-5 text-primary" /> Your data rights
          </h2>
          <Card className="space-y-3 p-6 text-sm leading-relaxed">
            <p>
              Under POPIA (South Africa) and GDPR (EU), you can request access, correction, or
              deletion of your personal data at any time.
            </p>
            <p>
              Account deletion is self-serve from your profile settings, or by emailing the address
              below.
            </p>
            <p>
              A Data Processing Addendum is available for business customers:{" "}
              <Link to="/legal/dpa" className="text-primary underline">
                /legal/dpa
              </Link>
              .
            </p>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <Mail className="h-5 w-5 text-primary" /> Report a vulnerability
          </h2>
          <Card className="space-y-3 p-6 text-sm leading-relaxed">
            <p>
              Found a security issue? Please email{" "}
              <a href="mailto:admin@cuddles-ai.com" className="text-primary underline">
                admin@cuddles-ai.com
              </a>{" "}
              with details and steps to reproduce. We aim to acknowledge within 3 business days. We
              do not currently run a bug bounty, but we credit responsible reporters on request.
            </p>
            <p className="text-xs text-muted-foreground">
              Machine-readable contact: <code>/.well-known/security.txt</code>
            </p>
          </Card>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long" })}
        </p>
      </main>
    </div>
  );
}
