import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LegalPageLayout from "@/components/LegalPageLayout";

const updated = "2 October 2026";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy | Cuddles AI"
        description="How Cuddles AI collects, uses, shares, protects and deletes personal information, including AI chats, newsletters, accounts and business widgets."
        url="/privacy-policy"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Cuddles AI Privacy Policy",
          url: "https://cuddles-ai.com/privacy-policy",
          dateModified: "2026-10-02",
        }}
      />
      <LegalPageLayout
        eyebrow="Privacy at Cuddles AI"
        title="Privacy Policy"
        summary="This policy explains what personal information Cuddles AI handles, why we use it, who may receive it, and the choices available to you."
        updated={updated}
        notice={
          <p>
            This policy should be read with our <Link to="/terms">Terms and Conditions</Link> and our dedicated <Link to="/popia">POPIA notice</Link>. Cuddles provides general plant and cannabis education only, not medical advice.
          </p>
        }
        sections={[
          {
            id: "who-we-are",
            label: "Who we are",
            content: <p>Cuddles AI is operated by Tripple444. For South African data-protection purposes, Tripple444 is the responsible party for personal information it decides how and why to process. Business customers may be responsible parties for information collected through their own Cuddles widget, while we process that information for them.</p>,
          },
          {
            id: "information-we-collect",
            label: "Information we collect",
            content: (
              <>
                <p>Depending on how you use Cuddles, we may collect:</p>
                <ul>
                  <li><strong>Account details:</strong> name, email address, securely stored sign-in credentials, profile preferences and subscription status.</li>
                  <li><strong>AI and plant-care activity:</strong> questions, chat history, feedback, saved preferences, journal entries and images you choose to upload for identification.</li>
                  <li><strong>Orders and business activity:</strong> cart contents, delivery details, order status, demo requests, business contact details and catalogue information.</li>
                  <li><strong>Newsletter and communications:</strong> email address, consent status, confirmation, unsubscribe and email-delivery events. Newsletter contacts are managed by our email delivery provider.</li>
                  <li><strong>Location:</strong> approximate or precise location only when you allow it for nearby shops or delivery estimates. You may use available manual location choices instead.</li>
                  <li><strong>Technical and usage data:</strong> IP address, device and browser details, pages viewed, interactions, error information, cookies and similar storage.</li>
                </ul>
                <p>Payment providers process card or banking details on their own secure pages. Cuddles receives payment status and related transaction references, not your full card number.</p>
              </>
            ),
          },
          {
            id: "how-we-use-information",
            label: "How we use information",
            content: (
              <ul>
                <li>Provide accounts, AI answers, plant tools, recommendations, orders, subscriptions and customer support.</li>
                <li>Remember preferences and improve the clarity, safety and relevance of Cuddles.</li>
                <li>Send service messages and, only where permitted, newsletter or marketing messages.</li>
                <li>Protect accounts, prevent spam, fraud and misuse, enforce limits, and investigate technical or security incidents.</li>
                <li>Measure service performance and understand aggregate use where analytics consent is required and given.</li>
                <li>Meet contractual, tax, accounting and legal obligations, and establish or defend legal claims.</li>
              </ul>
            ),
          },
          {
            id: "legal-basis",
            label: "Why processing is allowed",
            content: <p>We rely on consent where you choose optional features, precise location, analytics or direct marketing; contract where processing is needed to provide a requested service; legal obligations where records or disclosures are required; and legitimate interests such as keeping Cuddles secure and improving it, provided those interests do not unfairly override your rights. Our <Link to="/popia">POPIA notice</Link> explains these grounds in the South African context.</p>,
          },
          {
            id: "ai-processing",
            label: "AI chats and uploaded content",
            content: (
              <>
                <p>Your message and relevant context may be sent to contracted AI service providers to generate a response. Cuddles pulls in relevant information (your saved preferences, journal entries and our knowledge library) at the moment you ask a question. To improve Cuddles for everyone, we may add anonymised questions and answers from chats to our knowledge library, after removing emails, phone numbers, links and names. We do not fine-tune AI models on your chats. You can ask us to exclude your chats under POPIA. Uploaded images may also be processed for plant or strain identification. Do not include unnecessary sensitive personal information in a chat or image.</p>
                <p>AI responses can be incomplete or wrong. They are generated for general education and product discovery and must not be treated as medical, legal or other professional advice. Important decisions should be checked with a suitably qualified person.</p>
              </>
            ),
          },
          {
            id: "sharing",
            label: "Who receives information",
            content: (
              <>
                <p>We do not sell personal information. We share only what is reasonably needed with contracted providers that support hosting, data storage, authentication, AI processing, email delivery, analytics, maps and payments.</p>
                <p>If you choose to contact or order from an independent partner shop, information needed to handle that request may go to that partner. The partner is responsible for its own privacy practices. We may also disclose information where law requires it, to protect people or the service, or as part of a legitimate business restructuring subject to continued safeguards.</p>
                <p>Business customers can review our <Link to="/legal/dpa">Data Processing Addendum</Link>, which describes the safeguards we apply to customer data.</p>
              </>
            ),
          },
          {
            id: "international-transfers",
            label: "International processing",
            content: <p>Some providers process information outside South Africa. Where this happens, we use contractual and organisational safeguards intended to provide protection consistent with POPIA section 72 and, where applicable, GDPR transfer rules.</p>,
          },
          {
            id: "retention",
            label: "How long we keep information",
            content: <p>We keep personal information only for as long as reasonably needed for the purpose collected, to provide your account or requested service, to meet legal and accounting duties, to resolve disputes, or to protect the service. Retention differs by record type. We delete or de-identify information when it is no longer needed, unless law requires it to be kept. You may request deletion, subject to lawful exceptions.</p>,
          },
          {
            id: "cookies",
            label: "Cookies and analytics",
            content: <p>Necessary storage keeps core features, security and your preferences working. Optional analytics helps us understand use and improve Cuddles. The cookie banner lets you accept all or choose necessary only. You can also clear stored choices in your browser. Withdrawing optional consent does not affect processing that happened lawfully before withdrawal.</p>,
          },
          {
            id: "security",
            label: "How we protect information",
            content: <p>We use reasonable technical and organisational safeguards, including encrypted connections, access controls, database-level access policies, managed secrets, rate limits, monitoring and restricted administrative access. No online service can promise absolute security. Please contact us promptly if you believe your account or information has been compromised.</p>,
          },
          {
            id: "your-rights",
            label: "Your choices and rights",
            content: (
              <>
                <p>Depending on applicable law, you may ask to access, correct or delete personal information; object to or restrict processing; withdraw consent; request a portable copy; or complain to a regulator. You may unsubscribe from marketing at any time using the link in an email or our unsubscribe page.</p>
                <p>Send requests to <a href="mailto:admin@cuddles-ai.com">admin@cuddles-ai.com</a>. We may need to verify your identity and may retain information where law permits or requires it. See the <Link to="/popia">POPIA page</Link> for South African rights and complaint details.</p>
              </>
            ),
          },
          {
            id: "children",
            label: "Age and children",
            content: <p>General plant-care information is available broadly, but cannabis-related features are only for adults who meet the legal age in their location. We do not knowingly invite children to provide personal information for cannabis-related use. Contact us if you believe a child has supplied information inappropriately.</p>,
          },
          {
            id: "changes-contact",
            label: "Changes and contact",
            content: (
              <>
                <p>We may update this policy when our services, providers or legal duties change. We will update the date above and give an appropriate notice for material changes.</p>
                <p>Privacy and Information Officer enquiries: <a href="mailto:admin@cuddles-ai.com">admin@cuddles-ai.com</a>. Website: <a href="https://cuddles-ai.com">cuddles-ai.com</a>.</p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}