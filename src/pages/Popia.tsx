import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LegalPageLayout from "@/components/LegalPageLayout";

export default function Popia() {
  return (
    <>
      <SEO
        title="POPIA Notice and Data Rights | Cuddles AI"
        description="Cuddles AI's South African POPIA notice: responsible party, processing purposes, data-subject rights, direct marketing and complaints."
        url="/popia"
        structuredData={{ "@context": "https://schema.org", "@type": "WebPage", name: "Cuddles AI POPIA Notice", url: "https://cuddles-ai.com/popia", dateModified: "2026-10-02" }}
      />
      <LegalPageLayout
        eyebrow="South African data rights"
        title="POPIA Notice"
        summary="This notice summarises how Cuddles AI applies South Africa's Protection of Personal Information Act, 4 of 2013 (POPIA)."
        updated="2 October 2026"
        notice={<p>This notice complements our full <Link to="/privacy-policy">Privacy Policy</Link>. It provides general transparency information and is not legal advice.</p>}
        sections={[
          { id: "responsible-party", label: "Responsible party", content: <p>Tripple444, as operator of Cuddles AI, is the responsible party when it determines why and how personal information is processed. Privacy and Information Officer enquiries may be sent to <a href="mailto:admin@cuddles-ai.com">admin@cuddles-ai.com</a>.</p> },
          { id: "information-purpose", label: "Information and purpose", content: <><p>We process account, contact, chat, uploaded image, preference, order, newsletter, business, location and technical information only where relevant to:</p><ul><li>provide and secure Cuddles services;</li><li>answer AI and support requests;</li><li>manage subscriptions, orders and business relationships;</li><li>send requested communications and consented marketing;</li><li>improve performance and prevent abuse;</li><li>meet legal, accounting and regulatory duties.</li></ul><p>The detailed categories are listed in our <Link to="/privacy-policy#information-we-collect">Privacy Policy</Link>.</p></> },
          { id: "lawful-processing", label: "Lawful processing", content: <p>We aim to process information lawfully, reasonably and transparently; collect only what is adequate, relevant and not excessive; keep it accurate where reasonably practicable; use it for a specific, lawful purpose; and retain it only as long as justified. Processing may be based on consent, performance of a contract, legal duty, protection of a legitimate interest, or another ground permitted by POPIA.</p> },
          { id: "collection", label: "How information is collected", content: <p>Most information comes directly from you when you create an account, chat, upload an image, complete a form, subscribe or place an order. Some technical information is generated when you use the service. Business customers or partner shops may provide authorised catalogue or customer-service information. Service providers may return payment, email-delivery or security status information.</p> },
          { id: "recipients", label: "Operators and recipients", content: <p>We use operators and service providers for hosting, storage, authentication, AI processing, email, analytics, maps and payments. They receive only information reasonably needed for their work and are expected to protect it. Independent shops may receive information when you choose to contact or order from them. See our <Link to="/trust">Trust &amp; Security page</Link> and <Link to="/legal/dpa">Data Processing Addendum</Link>.</p> },
          { id: "cross-border", label: "Cross-border transfers", content: <p>Some providers operate outside South Africa. We seek to use agreements and safeguards that satisfy POPIA section 72, including protections that are substantially similar to POPIA, consent where appropriate, or another lawful transfer ground.</p> },
          { id: "direct-marketing", label: "Newsletters and direct marketing", content: <><p>We send newsletters or promotional email only where there is a valid permission or another lawful basis. Newsletter invitations ask recipients to choose whether to subscribe. A person is added to the newsletter list only after the required confirmation.</p><p>Every marketing email should provide an unsubscribe route. You can also use <Link to="/unsubscribe">our unsubscribe page</Link>. Opting out is free. We keep a limited suppression record so the address is not accidentally added again.</p></> },
          { id: "rights", label: "Your POPIA rights", content: <><p>Subject to POPIA and lawful exceptions, you may:</p><ul><li>ask whether we hold personal information about you and request access;</li><li>ask us to correct, update, delete or destroy information that is inaccurate, irrelevant, excessive, outdated, incomplete, misleading or unlawfully obtained;</li><li>object to certain processing on reasonable grounds;</li><li>withdraw consent where consent is the processing basis;</li><li>object to direct marketing at any time;</li><li>complain to the Information Regulator or seek a lawful remedy.</li></ul></> },
          { id: "requests", label: "How to make a request", content: <p>Email <a href="mailto:admin@cuddles-ai.com">admin@cuddles-ai.com</a> with enough detail to identify the information and request. We may ask for reasonable identity verification before disclosing or changing information. We will respond within the periods required by applicable law. A lawful fee may apply only where POPIA or related access-to-information law permits it, and you will be told beforehand.</p> },
          { id: "automated-decisions", label: "AI and automated processing", content: <p>Cuddles uses automated systems to generate educational answers, match preferences and suggest products. These outputs are advisory and may be wrong. Cuddles does not intend these tools to make a decision that produces legal consequences or similarly significant effects about you without appropriate human involvement where POPIA requires it.</p> },
          { id: "security-breaches", label: "Security and breaches", content: <p>We use reasonable technical and organisational safeguards appropriate to the information and risk. If there are reasonable grounds to believe personal information has been accessed or acquired by an unauthorised person, we will follow POPIA's notification requirements, subject to any lawful delay required by an investigating authority.</p> },
          { id: "complaints", label: "Questions and complaints", content: <><p>Please first contact our Information Officer at <a href="mailto:admin@cuddles-ai.com">admin@cuddles-ai.com</a> so we can investigate.</p><p>You may also contact the <strong>Information Regulator (South Africa)</strong> through its official website at <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a>. Please use the regulator's current published complaint channels and forms, as contact details may change.</p></> },
        ]}
      />
    </>
  );
}