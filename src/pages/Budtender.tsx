import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Calculator, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import ProductSearch from "@/components/budtender/ProductSearch";
import DosageGuidePanel from "@/components/budtender/DosageGuidePanel";
import DispensaryFinderPanel from "@/components/budtender/DispensaryFinderPanel";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Budtender — search products, strains, dosage and shops",
  description:
    "Search cannabis products and strains, read plain-language dosage guides, and find dispensaries near you.",
  url: "https://cuddles-ai.com/budtender",
};

const Budtender = () => {
  const [tab, setTab] = useState("search");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Budtender: Strain Search, Dosage Guide & Shop Finder"
        description="Search cannabis products and strains, get plain-language dosage guidance, and find dispensaries near you — all in one place."
        url="/budtender"
        keywords="budtender app, cannabis product search, strain finder, cannabis dosage guide, dispensary near me South Africa"
        structuredData={jsonLd}
      />
      <ThemeToggle />

      <main className="container mx-auto max-w-5xl px-4 py-14">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Leaf className="h-4 w-4" /> Your budtender
          </div>
          <h1 className="mb-3 font-display text-4xl font-bold text-foreground md:text-5xl">
            Find it, understand it, buy it
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Search everything we know about, see how much to take, and find a shop near you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/ai-budtender">
                <MessageCircle className="mr-2 h-4 w-4" /> Ask Cuddles
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" /> Cart &amp; delivery
              </Link>
            </Button>
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="dosage" className="gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Dosage</span>
            </TabsTrigger>
            <TabsTrigger value="shops" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Shops</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-8">
            <ProductSearch />
          </TabsContent>
          <TabsContent value="dosage" className="mt-8">
            <DosageGuidePanel />
          </TabsContent>
          <TabsContent value="shops" className="mt-8">
            <DispensaryFinderPanel />
          </TabsContent>
        </Tabs>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Educational information only, not medical advice. For adults of legal age.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Budtender;
