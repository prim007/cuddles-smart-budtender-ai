import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check, Copy, Globe, MessageCircle, Plug, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildEmbedSnippet, MCP_SERVER_URL } from "@/lib/embedSnippet";

const EXAMPLE_SNIPPET = buildEmbedSnippet({ key: "YOUR_SHOP_KEY", color: "#F97352" });

const sections = [
  { id: "overview", label: "Ways to install" },
  { id: "website", label: "Website chat" },
  { id: "platforms", label: "WordPress, Wix, Shopify" },
  { id: "options", label: "Settings" },
  { id: "menu", label: "Your menu & reports" },
  { id: "ai-assistants", label: "AI assistants (MCP)" },
  { id: "phone", label: "Phone app" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "privacy", label: "Privacy & rules" },
];

const platforms = [
  {
    name: "WordPress",
    steps: [
      "Install a free plugin such as “WPCode” or “Insert Headers and Footers”.",
      "Open the plugin's Footer box.",
      "Paste your Cuddles code and save.",
    ],
  },
  {
    name: "Wix",
    steps: [
      "Go to Settings → Custom Code → Add Custom Code.",
      "Paste your Cuddles code, choose “All pages” and “Body – end”.",
      "Click Apply, then publish your site.",
    ],
  },
  {
    name: "Shopify",
    steps: [
      "Go to Online Store → Themes → … → Edit code.",
      "Open theme.liquid and find the closing </body> line.",
      "Paste your Cuddles code just above it and save.",
    ],
  },
  {
    name: "Squarespace",
    steps: [
      "Go to Settings → Advanced → Code Injection.",
      "Paste your Cuddles code into the Footer box.",
      "Save. Code injection needs a Business plan or higher.",
    ],
  },
  {
    name: "Any other website",
    steps: [
      "Open your site's main page template (or ask your web person).",
      "Paste the code just before the closing </body> tag.",
      "Save and upload. It works on every page that uses that template.",
    ],
  },
];

const options = [
  { name: "data-key", needed: "Required", what: "Your shop's private key from setup. Connects the chat to your shop and menu." },
  { name: "data-color", needed: "Optional", what: "Your brand colour for the chat button and header, e.g. #F97352." },
  { name: "data-position", needed: "Optional", what: "“right” (default) or “left” — which bottom corner the chat button sits in." },
];

const mcpTools = [
  { name: "list_dispensary_menus", what: "Lists partner shop menus available through Cuddles." },
  { name: "get_dispensary_menu", what: "Returns one partner menu with categories and items." },
  { name: "search_strains", what: "Searches the public strain library by name or effect (sleep, energy, stress and more)." },
];

const problems = [
  {
    q: "The chat button doesn't appear",
    a: "Check the code was pasted before </body> and that your site was saved or published. Clear your browser cache and reload. Website builders often only show custom code on the live site, not in the editor preview.",
  },
  {
    q: "The chat says “Invalid embed key”",
    a: "The key in data-key doesn't match your shop. Copy the code again from your shop setup page — keys are case-sensitive.",
  },
  {
    q: "The chat works on one website but not another",
    a: "For safety, your key only works on the website address saved in your shop setup (and its subdomains). Use the same address your visitors see, or contact us to change it.",
  },
  {
    q: "The chat stopped answering",
    a: "Your free trial may have ended, or the shop subscription is paused. Open your shop setup page to check, or get in touch and we'll look.",
  },
  {
    q: "The chat doesn't know my products",
    a: "Add your products on the Manage menu page. Cuddles only recommends what's on your menu there.",
  },
];

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked; the code is still selectable */
    }
  };
  return (
    <div className="relative rounded-xl bg-muted border border-border">
      <pre className="p-4 pr-24 text-xs md:text-sm font-mono text-foreground overflow-x-auto whitespace-pre">{code}</pre>
      <Button size="sm" variant="ghost" onClick={copy} className="absolute top-2 right-2" aria-label={`Copy ${label}`}>
        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function Section({ id, icon: Icon, title, children }: { id: string; icon: typeof Globe; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="flex items-center gap-3 text-2xl font-display font-bold text-foreground">
        <Icon className="w-6 h-6 text-primary shrink-0" />
        {title}
      </h2>
      {children}
    </section>
  );
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Install Cuddles AI on your website or system",
  description:
    "Step-by-step guide to adding the Cuddles AI chat to any website, connecting AI assistants, and installing the phone app.",
  url: "https://cuddles-ai.com/docs",
  publisher: { "@type": "Organization", name: "Cuddles AI" },
};

const Docs = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Install Cuddles AI on Your Website | Docs"
      description="How to add the Cuddles AI plant and cannabis chat to WordPress, Wix, Shopify or any website with one line of code, plus AI assistant and phone app setup."
      url="/docs"
      keywords="install Cuddles AI, dispensary website chat, embed AI budtender, WordPress cannabis chat, Shopify AI chat widget, Cuddles docs"
      structuredData={structuredData}
    />

    <main className="container mx-auto max-w-6xl px-4 pt-28 pb-16">
      <header className="max-w-3xl space-y-4 mb-12">
        <p className="text-primary text-sm font-medium uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Docs
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
          Install Cuddles in your own system
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Add Cuddles to your shop's website with one line of code — no developer needed. You can also connect it to AI
          assistants or install it on your phone. This guide covers each option step by step.
        </p>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors">
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-14 min-w-0">
          <Section id="overview" icon={Plug} title="Ways to install">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Globe, title: "Website chat", body: "A chat button on your shop's site that answers plant and product questions from your menu.", href: "#website" },
                { icon: MessageCircle, title: "AI assistants", body: "Let tools like Claude look up Cuddles strain info and partner menus.", href: "#ai-assistants" },
                { icon: Smartphone, title: "Phone app", body: "Install the full Cuddles app on Android or iPhone from your browser.", href: "#phone" },
              ].map((c) => (
                <a key={c.title} href={c.href} className="block">
                  <Card className="p-5 h-full hover:border-primary/50 transition-colors">
                    <c.icon className="w-6 h-6 text-primary mb-3" />
                    <h3 className="text-base font-semibold font-sans text-foreground mb-1">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </Card>
                </a>
              ))}
            </div>
          </Section>

          <Section id="website" icon={Globe} title="Add the chat to your website">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">1</span>
                <div>
                  <p className="font-semibold text-foreground">Set up your shop</p>
                  <p className="text-sm text-muted-foreground">
                    Go to <Link to="/dispensary-onboarding" className="text-primary underline underline-offset-2">shop setup</Link>, sign in,
                    and enter your shop name, email and <strong>website address</strong>. New shops get a 14-day free trial.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">2</span>
                <div>
                  <p className="font-semibold text-foreground">Copy your code</p>
                  <p className="text-sm text-muted-foreground">
                    At the end of setup you'll see your personal code with your shop key already filled in. It looks like this:
                  </p>
                </div>
              </li>
            </ol>
            <CodeBlock code={EXAMPLE_SNIPPET} label="example install code" />
            <ol start={3} className="space-y-4">
              <li className="flex gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">3</span>
                <div>
                  <p className="font-semibold text-foreground">Paste it into your site</p>
                  <p className="text-sm text-muted-foreground">
                    Put it just before the closing <code className="font-mono text-foreground">&lt;/body&gt;</code> tag so it loads on
                    every page. See the <a href="#platforms" className="text-primary underline underline-offset-2">steps for your website builder</a> below.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">4</span>
                <div>
                  <p className="font-semibold text-foreground">Check it works</p>
                  <p className="text-sm text-muted-foreground">
                    Open your live website. A round chat button appears in the bottom corner. Click it and ask a question.
                  </p>
                </div>
              </li>
            </ol>
            <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4">
              Replace <code className="font-mono text-foreground">YOUR_SHOP_KEY</code> with your own key — the example above won't work as-is.
              Your key only works on the website address saved in your setup.
            </p>
          </Section>

          <Section id="platforms" icon={Wrench} title="Steps for popular website builders">
            <div className="grid md:grid-cols-2 gap-4">
              {platforms.map((p) => (
                <Card key={p.name} className="p-5">
                  <h3 className="text-base font-semibold font-sans text-foreground mb-3">{p.name}</h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-sm text-muted-foreground">
                    {p.steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Website builders change their menus from time to time. If a step doesn't match what you see, look for “custom code”,
              “code injection” or “footer code”.
            </p>
          </Section>

          <Section id="options" icon={Wrench} title="Settings you can change">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="p-3 font-semibold text-foreground">Setting</th>
                      <th className="p-3 font-semibold text-foreground">Needed?</th>
                      <th className="p-3 font-semibold text-foreground">What it does</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((o) => (
                      <tr key={o.name} className="border-t border-border">
                        <td className="p-3 font-mono text-foreground whitespace-nowrap">{o.name}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{o.needed}</td>
                        <td className="p-3 text-muted-foreground">{o.what}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="text-sm text-muted-foreground">Example with the button on the left:</p>
            <CodeBlock code={buildEmbedSnippet({ key: "YOUR_SHOP_KEY", color: "#F97352", position: "left" })} label="left-side example" />
          </Section>

          <Section id="menu" icon={BookOpen} title="Your menu and weekly report">
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">Add your products</strong> on the{" "}
                <Link to="/manage-strains" className="text-primary underline underline-offset-2">Manage menu</Link> page. The chat on your
                website only recommends what's listed there.
              </li>
              <li>
                <strong className="text-foreground">See what visitors ask</strong> on your{" "}
                <Link to="/insights" className="text-primary underline underline-offset-2">shop report</Link>: number of questions this week
                and the top topics. Only topic labels are kept — never what visitors typed.
              </li>
              <li>
                <strong className="text-foreground">Using a till or POS system?</strong> Automatic product syncing isn't switched on yet.{" "}
                <Link to="/schedule-demo" className="text-primary underline underline-offset-2">Get in touch</Link> and we'll help you load
                your menu. See <Link to="/pos-integrations" className="text-primary underline underline-offset-2">POS integrations</Link> for what's planned.
              </li>
            </ul>
          </Section>

          <Section id="ai-assistants" icon={MessageCircle} title="Connect AI assistants (MCP)">
            <p className="text-muted-foreground">
              Cuddles works with AI assistants that support MCP (Model Context Protocol), such as Claude. Add Cuddles as a custom
              connector using this address, then sign in with your Cuddles account when asked:
            </p>
            <CodeBlock code={MCP_SERVER_URL} label="AI assistant connection address" />
            <Card className="p-5">
              <h3 className="text-base font-semibold font-sans text-foreground mb-3">What the assistant can do</h3>
              <ul className="space-y-2 text-sm">
                {mcpTools.map((t) => (
                  <li key={t.name}>
                    <code className="font-mono text-foreground">{t.name}</code>
                    <span className="text-muted-foreground"> — {t.what}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <p className="text-xs text-muted-foreground">Read-only: the assistant can look things up, but can't place orders or change anything.</p>
          </Section>

          <Section id="phone" icon={Smartphone} title="Install the phone app">
            <p className="text-muted-foreground">
              Open <Link to="/install" className="text-primary underline underline-offset-2">cuddles-ai.com/install</Link> on your phone.
              On Android tap <strong className="text-foreground">Install</strong>; on iPhone tap Share, then{" "}
              <strong className="text-foreground">Add to Home Screen</strong>. No app store needed.
            </p>
          </Section>

          <Section id="troubleshooting" icon={Wrench} title="Troubleshooting">
            <div className="space-y-3">
              {problems.map((p) => (
                <Card key={p.q} className="p-5">
                  <h3 className="text-base font-semibold font-sans text-foreground mb-1">{p.q}</h3>
                  <p className="text-sm text-muted-foreground">{p.a}</p>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="privacy" icon={ShieldCheck} title="Privacy and rules">
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Keep your shop key to yourself. It's locked to your website, but don't post it publicly.</li>
              <li>Cuddles gives general plant and cannabis education only. It is <strong className="text-foreground">not medical or legal advice</strong>.</li>
              <li>The chat doesn't take payments. Selling cannabis is still illegal in South Africa — make sure what your shop offers follows the law.</li>
              <li>
                Visitor data is handled under POPIA. See our <Link to="/privacy-policy" className="text-primary underline underline-offset-2">Privacy Policy</Link> and{" "}
                <Link to="/legal/dpa" className="text-primary underline underline-offset-2">Data Processing Agreement</Link>.
              </li>
            </ul>
          </Section>

          <Card className="p-6 md:p-8 bg-primary/10 border-primary/30 text-center space-y-4">
            <h2 className="text-2xl font-display font-bold text-foreground">Ready to add Cuddles to your site?</h2>
            <p className="text-muted-foreground">Set up takes about two minutes. Stuck? We'll install it with you.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg"><Link to="/dispensary-onboarding">Start shop setup</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/schedule-demo">Get help installing</Link></Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Docs;
