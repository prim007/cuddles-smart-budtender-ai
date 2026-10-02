import type { ReactNode } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

type LegalSection = {
  id: string;
  label: string;
  content: ReactNode;
};

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
  notice?: ReactNode;
};

export default function LegalPageLayout({
  eyebrow,
  title,
  summary,
  updated,
  sections,
  notice,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
          <nav aria-label="Legal pages" className="hidden items-center gap-5 text-sm sm:flex">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/popia" className="text-muted-foreground hover:text-foreground">POPIA</Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {eyebrow}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold text-foreground md:text-5xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{summary}</p>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: {updated}</p>
          </div>
        </div>

        <div className="container mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-[220px_minmax(0,1fr)] md:py-14">
          <aside>
            <details className="rounded-lg border border-border bg-card p-4 md:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">On this page</summary>
              <nav aria-label="On this page" className="mt-3">
                <ol className="space-y-1 border-l border-border">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="block py-1.5 pl-4 text-sm text-muted-foreground hover:text-foreground">
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
            <nav aria-label="On this page" className="hidden md:sticky md:top-24 md:block">
              <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>
              <ol className="space-y-1 border-l border-border">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 space-y-10">
            {notice && (
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-5 text-sm leading-6 text-foreground/85">
                {notice}
              </div>
            )}
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 border-b border-border pb-10 last:border-0">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  {index + 1}. {section.label}
                </h2>
                <div className="space-y-4 text-[0.95rem] leading-7 text-foreground/80 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_li]:pl-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                  {section.content}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}