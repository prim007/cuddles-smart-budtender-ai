import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DISPENSARY_MENUS } from "@/data/dispensaryMenus";
import ChatMenuCard from "@/components/ChatMenuCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Map URL slugs to menu ids
const SLUG_TO_ID: Record<string, string> = {
  "dirty-vapes": "dirty-vapes",
  "tripple-four": "tripple444",
  "tripple444": "tripple444",
  "lef-labs": "leaf-labs",
  "leaf-labs": "leaf-labs",
};

interface Props {
  slug?: string;
}

const MenuPage = ({ slug: propSlug }: Props) => {
  const params = useParams();
  const slug = propSlug ?? params.slug ?? "";
  const menuId = SLUG_TO_ID[slug];
  const menu = DISPENSARY_MENUS.find((m) => m.id === menuId);

  if (!menu) return <Navigate to="/" replace />;

  const title = `${menu.label} · Cuddles`;
  const description = `${menu.label} — live menu and pricing. ${menu.disclaimer ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description.slice(0, 160)} />
        <link rel="canonical" href={`https://cuddles-ai.com/${slug}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description.slice(0, 160)} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/" aria-label="Back to Cuddles home">
              <ArrowLeft className="mr-2 h-4 w-4" /> Home
            </Link>
          </Button>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {menu.label}
          </h1>
          {menu.contact && (
            <p className="mt-2 text-sm text-muted-foreground">{menu.contact}</p>
          )}
        </header>

        <ChatMenuCard menu={menu} />

        {menu.disclaimer && (
          <p className="mt-6 text-xs text-muted-foreground">{menu.disclaimer}</p>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
