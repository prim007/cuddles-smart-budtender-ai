import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LegalPageLayout from "@/components/LegalPageLayout";

export default function Copyright() {
  return (
    <>
      <SEO
        title="Copyright & Takedown Policy | Cuddles AI"
        description="How to report copyright-infringing or otherwise unlawful material on Cuddles AI, what a valid notice must contain, how counter-notices work, and our repeat-infringer policy."
        url="/copyright"
        structuredData={{ "@context": "https://schema.org", "@type": "WebPage", name: "Cuddles AI Copyright & Takedown Policy", url: "https://cuddles-ai.com/copyright", dateModified: "2026-11-13" }}
      />
      <LegalPageLayout
        eyebrow="Rights and notices"
        title="Copyright & Takedown Policy"
        summary="If you believe material published on Cuddles AI infringes your copyright, or is otherwise unlawful, this page explains how to tell us, what your notice must contain, what happens next, and how to respond if your own material was removed."
        updated="13 November 2026"
        notice={
          <p>
            This policy is written for South Africa and is modelled on the notice-and-takedown
            approach used internationally. It is general information, not legal advice. If a
            notice or a removal affects a real commercial interest of yours, speak to an
            intellectual-property practitioner before you rely on this page.
          </p>
        }
        sections={[
          {
            id: "scope",
            label: "What this policy covers",
            content: (
              <>
                <p>
                  This policy applies to material published by Cuddles AI at
                  cuddles-ai.com and its sub-pages, and to material published through the
                  Cuddles AI website widget embedded on partner shop sites. It covers two
                  kinds of complaint:
                </p>
                <ul>
                  <li>
                    <strong>Copyright claims</strong> — photographs, illustrations, artwork,
                    videos, articles, extracts, product descriptions and other works that you
                    own or represent and that appear on Cuddles without your permission.
                  </li>
                  <li>
                    <strong>Other unlawful content</strong> — material that is defamatory,
                    impersonates a person or business, discloses personal information
                    unlawfully, or misrepresents a licence or the lawful status of a cannabis
                    business.
                  </li>
                </ul>
                <p>
                  Complaints about a partner shop's own prices, stock, licensing or conduct go
                  to that shop directly. Cuddles does not sell or deliver cannabis and does not
                  verify a partner's legal status; see our{" "}
                  <Link to="/terms">Terms and Conditions</Link> and{" "}
                  <Link to="/licensing">Licensing</Link> pages.
                </p>
              </>
            ),
          },
          {
            id: "where-content-sits",
            label: "Where published content comes from",
            content: (
              <>
                <p>So you can tell us precisely what to look at, here is what Cuddles publishes and who wrote it:</p>
                <ul>
                  <li>
                    <strong>Blog and education articles</strong> — written by Cuddles AI. Some
                    quote, summarise or link to outside sources and name them.
                  </li>
                  <li>
                    <strong>Strain reviews and journal entries</strong> — written by registered
                    users about their own experience.
                  </li>
                  <li>
                    <strong>Shop menus, catalogues and business details</strong> — supplied by
                    the shop that owns them.
                  </li>
                  <li>
                    <strong>Generated images</strong> — created by a user from a written
                    description through Cuddles AI Image Studio.
                  </li>
                  <li>
                    <strong>City and strain directory pages</strong> — compiled by Cuddles AI
                    from public sources and partner data.
                  </li>
                </ul>
                <p>
                  Private material — your own chat history, journal entries, plant records and
                  companion rooms — is not published to other users and is not reachable through
                  this policy. Material a user chose to share with a connected friend is an
                  exception; tell us and we will investigate.
                </p>
              </>
            ),
          },
          {
            id: "reporting",
            label: "How to report material",
            content: (
              <>
                <p>
                  Send your notice by email to{" "}
                  <a href="mailto:admin@cuddles-ai.com?subject=Takedown%20Notice">
                    admin@cuddles-ai.com
                  </a>{" "}
                  with the subject line <strong>Takedown Notice</strong>. A notice must be in
                  writing and must include all of the following:
                </p>
                <ul>
                  <li>Your full name and physical postal address, and your signature — written or electronic.</li>
                  <li>
                    If you are acting for someone else, your authority to do so and the name of
                    the rights owner.
                  </li>
                  <li>
                    The right you believe has been infringed — for example copyright in a
                    specific photograph, illustration or text — and how you own or represent it.
                  </li>
                  <li>
                    The exact material concerned: the web address of every page it appears on,
                    and a description or copy of the material itself so we can find it without
                    guessing.
                  </li>
                  <li>What you want us to do — remove it, hide it, correct an attribution, or licence it.</li>
                  <li>Your telephone number and email address.</li>
                  <li>
                    A statement that you have a good-faith belief that the use is not authorised
                    by the rights owner, its agent, or the law.
                  </li>
                  <li>
                    A statement that the information in your notice is accurate and that you are
                    the rights owner or authorised to act for the rights owner.
                  </li>
                </ul>
                <p>
                  A notice that leaves out any of these items is incomplete. We will tell you
                  what is missing rather than act on a defective notice, because removing
                  material on a weak claim harms the person who posted it.
                </p>
              </>
            ),
          },
          {
            id: "after-reporting",
            label: "What happens after we receive a notice",
            content: (
              <>
                <p>
                  We acknowledge a complete notice within <strong>2 business days</strong> and
                  aim to act within <strong>5 to 10 business days</strong>, depending on how
                  complicated the material is and whether we need to contact the person who
                  posted it. Depending on the outcome we may:
                </p>
                <ul>
                  <li>Remove or disable access to the specific material.</li>
                  <li>Correct or add an attribution where the real complaint is a missing credit.</li>
                  <li>Ask the person who posted it to provide evidence of permission.</li>
                  <li>Decline the notice and explain why — for example where the use appears lawful, is a short factual quotation with a source, or the claim is not yours to make.</li>
                </ul>
                <p>
                  Where material is removed, we tell the person who posted it what was removed
                  and why, and point them to the counter-notice step below so they can respond.
                  We do not assess whether material is unlawful as a legal matter; we decide
                  whether a notice is procedurally sound and whether the use looks authorised,
                  and we act proportionately.
                </p>
                <p>
                  If you believe a notice you received from us was mistaken, do not repost the
                  same material unchanged — send a counter-notice first.
                </p>
              </>
            ),
          },
          {
            id: "counter-notice",
            label: "If your material was removed",
            content: (
              <>
                <p>
                  If you posted material that was removed after a notice and you believe that
                  was a mistake, send a counter-notice to{" "}
                  <a href="mailto:admin@cuddles-ai.com?subject=Counter-Notice">
                    admin@cuddles-ai.com
                  </a>{" "}
                  with the subject line <strong>Counter-Notice</strong>. It must include:
                </p>
                <ul>
                  <li>Your full name, physical postal address, telephone number and email address.</li>
                  <li>
                    A description of the material that was removed and the exact page it
                    appeared on.
                  </li>
                  <li>
                    A statement explaining why you believe the material was removed by mistake
                    or misidentification — for example that you own it, that you have a licence,
                    that the material is factual rather than expressive, or that the notice
                    described the wrong item.
                  </li>
                  <li>
                    A statement that you consent to the jurisdiction of the courts with lawful
                    jurisdiction in South Africa for any dispute arising from the notice, and
                    that you will accept service of process from the person who filed it.
                  </li>
                </ul>
                <p>
                  On receipt of a complete counter-notice we forward it to the person who filed
                  the original notice and tell them that the material may be restored unless
                  they confirm within <strong>10 business days</strong> that they have filed a
                  claim in a competent court or otherwise escalated the dispute. If they do not,
                  the material may be restored. If they do, the material stays down while the
                  dispute is resolved between the parties, and we will not act on the same notice
                  again without a court order or an agreed outcome.
                </p>
              </>
            ),
          },
          {
            id: "repeat-infringers",
            label: "Repeat infringers",
            content: (
              <>
                <p>
                  Cuddles AI maintains and applies a policy of suspending or terminating access
                  for users and partner shops that repeatedly post material which has been the
                  subject of valid notices. In practice that means:
                </p>
                <ul>
                  <li>
                    A first valid notice results in removal of the material and a warning to the
                    account holder.
                  </li>
                  <li>
                    Further valid notices about the same account lead to suspension of the
                    features involved — reviews, journal publishing, image generation, or a
                    shop's widget — until the account holder responds.
                  </li>
                  <li>
                    Persistent or deliberate infringement, or publishing material the account
                    holder knows they have no rights to, results in termination of the account
                    or the shop's licence.
                  </li>
                </ul>
                <p>
                  Termination follows the <Link to="/terms">Terms and Conditions</Link>, and a
                  shop's licence also follows the <Link to="/licensing">Licensing</Link> terms.
                  A terminated account may still request a copy of its own personal information
                  under POPIA; see the <Link to="/popia">POPIA page</Link>.
                </p>
              </>
            ),
          },
          {
            id: "not-copyright",
            label: "Complaints that are not about copyright",
            content: (
              <>
                <p>
                  The same address handles notices about other unlawful activity. Send the same
                  details as above, but replace the "right infringed" item with the specific
                  harm — for example that the material is false and damaging to your business,
                  that it publishes your personal information, or that it claims a licence that
                  does not exist.
                </p>
                <p>
                  Where a complaint concerns personal information, the{" "}
                  <Link to="/popia">POPIA page</Link> sets out your rights and the contact
                  details of the Information Regulator (South Africa). Where it concerns a
                  partner shop's conduct or legal status, contact the shop and, where relevant,
                  the licensing authority in the province concerned — Cuddles cannot licence,
                  close or vouch for a shop it does not own.
                </p>
              </>
            ),
          },
          {
            id: "frameworks",
            label: "About the DMCA and South African takedown law",
            content: (
              <>
                <p>
                  Cuddles AI is operated by Tripple444 from South Africa. Complaints are handled
                  under South African law, principally the notice-and-takedown regime in the
                  Electronic Communications and Transactions Act 25 of 2002, which lets a
                  complainant serve a written notice on a service provider or its designated
                  agent and requires the provider to act on a procedurally valid notice to keep
                  its protection from liability.
                </p>
                <p>
                  The United States Digital Millennium Copyright Act (DMCA) is a separate
                  American law. It provides "safe harbour" protection to online service
                  providers that, among other things, register a designated agent with the
                  U.S. Copyright Office and publish that agent's contact details. Cuddles AI does
                  not claim that protection and has not filed a designated-agent registration
                  with the U.S. Copyright Office. If you are used to the DMCA process, send your
                  notice to the address above in DMCA format — the required contents are
                  essentially the same list set out in this policy — and we will treat it like
                  any other notice.
                </p>
                <p>
                  Because Cuddles AI does not rely on the DMCA safe harbour, a rights owner
                  whose material appears here may also approach the party who posted it, or the
                  host or platform concerned, directly. This policy is Cuddles AI's own
                  commitment to handle notices promptly; it is not a representation that any
                  statutory safe harbour applies.
                </p>
              </>
            ),
          },
          {
            id: "false-claims",
            label: "False and bad-faith notices",
            content: (
              <p>
                A notice must be accurate and sent in good faith. Sending a notice that you know
                is false — to silence a review you dislike, to remove a competitor's listing, or
                to claim rights you do not hold — wastes the process and may expose you to
                liability, including a claim for damages and for the costs caused by the
                removal. We keep a record of notices received and may refuse to act on further
                notices from a sender with a history of defective or bad-faith claims.
              </p>
            ),
          },
          {
            id: "contact",
            label: "Contact and changes",
            content: (
              <>
                <p>
                  All notices, counter-notices and questions about this policy go to{" "}
                  <a href="mailto:admin@cuddles-ai.com">admin@cuddles-ai.com</a>. Please include
                  the word <strong>Takedown</strong> or <strong>Counter-Notice</strong> in the
                  subject line so the message is routed correctly.
                </p>
                <p>
                  We may update this policy and will change the date at the top of the page.
                  Material already removed under an earlier version stays removed unless the
                  outcome is revisited. Related documents:{" "}
                  <Link to="/terms">Terms and Conditions</Link>,{" "}
                  <Link to="/licensing">Licensing</Link>,{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link>,{" "}
                  <Link to="/popia">POPIA &amp; Data Rights</Link>, and{" "}
                  <Link to="/trust">Trust &amp; Security</Link>.
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
