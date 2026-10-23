import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function DPA() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Data Processing Addendum | Cuddles AI"
        description="Data Processing Addendum (DPA) template for Cuddles AI business customers, aligned with POPIA and GDPR."
        url="/legal/dpa"
      />

      <main className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Data Processing Addendum</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Template — last updated {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long" })}. For an
          executed copy on your company letterhead, contact{" "}
          <a href="mailto:admin@cuddles-ai.com" className="text-primary underline">
            admin@cuddles-ai.com
          </a>
          .
        </p>

        <Card className="space-y-6 p-8 text-sm leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-semibold">1. Parties & scope</h2>
            <p>
              This Addendum is entered into between <strong>Tripple444 (Pty) Ltd</strong> trading as
              Cuddles AI ("Processor") and the customer ("Controller") and governs the processing
              of personal information by the Processor on behalf of the Controller in connection
              with the Cuddles AI services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">2. Definitions</h2>
            <p>
              "Personal Information" has the meaning given in the Protection of Personal
              Information Act, 2013 ("POPIA"). Where the Controller processes personal data of EU
              data subjects, "Personal Data" has the meaning given in the GDPR.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">3. Processing instructions</h2>
            <p>
              The Processor will process Personal Information only on documented instructions from
              the Controller, including with regard to transfers, unless required by law to do
              otherwise.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">4. Confidentiality</h2>
            <p>
              The Processor ensures that persons authorised to process the Personal Information are
              bound by confidentiality obligations.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">5. Security measures</h2>
            <p>
              The Processor implements appropriate technical and organisational measures including
              encryption in transit, encryption at rest, role-based access control, row-level
              security, leaked-password protection, rate limiting, and managed secret storage. See
              our <Link to="/trust" className="text-primary underline">Trust page</Link> for the
              current list of controls.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">6. Data subject rights</h2>
            <p>
              The Processor will assist the Controller, by appropriate technical and organisational
              measures, in responding to requests from data subjects to exercise their rights of
              access, correction, deletion, restriction, portability, and objection.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">7. Personal Information breaches</h2>
            <p>
              The Processor will notify the Controller without undue delay, and in any event within
              72 hours, after becoming aware of a Personal Information breach affecting the
              Controller's data.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">8. International transfers</h2>
            <p>
              Where Personal Information is transferred outside the Republic of South Africa or the
              EEA, the Processor relies on appropriate transfer mechanisms (e.g. Standard
              Contractual Clauses, adequacy decisions) in line with POPIA s.72 and GDPR Chapter V.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">9. Deletion or return of data</h2>
            <p>
              On termination of the services, the Processor will delete or return all Personal
              Information to the Controller within 30 days, except where retention is required by
              law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">10. Audit</h2>
            <p>
              The Processor will make available to the Controller information reasonably necessary
              to demonstrate compliance with this Addendum, and will allow for audits, including
              inspections, conducted by the Controller or a mandated auditor, subject to reasonable
              confidentiality and scheduling.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">11. Governing law</h2>
            <p>
              This Addendum is governed by the laws of the Republic of South Africa. Where GDPR
              applies, the parties additionally comply with the laws of the European Union and the
              relevant Member State.
            </p>
          </section>

          <p className="border-t pt-4 text-xs text-muted-foreground">
            This document is a template provided for transparency. It is not legal advice. Business
            customers requiring a signed DPA should contact admin@cuddles-ai.com.
          </p>
        </Card>
      </main>
    </div>
  );
}
