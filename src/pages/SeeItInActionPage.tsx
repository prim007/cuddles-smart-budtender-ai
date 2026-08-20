import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import SeeItInAction from "@/components/SeeItInAction";

const SeeItInActionPage = () => {
  return (
    <div className="min-h-screen md:pt-20">
      <SEO
        title="See Cuddles AI in Action — Label Scan, Live Menus, Feel Matching"
        description="Watch Cuddles AI read any cannabis label with OCR, pull a dispensary's live menu into chat, and match strains to how you want to feel. Shown, not told."
        url="/see-it-in-action"
        keywords="cannabis label scanner, OCR strain scanner, live dispensary menu, AI strain matching, Cuddles AI demo"
      />
      <main>
        <section className="pt-16 pb-4">
          <div className="container mx-auto px-4">
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
              <Link to="/" aria-label="Back to the Cuddles AI home page">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back home
              </Link>
            </Button>
            <div className="max-w-3xl">
              <h1 className="font-display font-bold text-foreground text-balance mb-4">
                Three things Cuddles does that no other budtender in South Africa does
              </h1>
              <p className="text-lg text-muted-foreground">
                Shown, not told — scan a label, pull a live menu, and match a strain to a feeling.
              </p>
            </div>
          </div>
        </section>
        <SeeItInAction hideHeading />
      </main>
      <Footer />
    </div>
  );
};

export default SeeItInActionPage;
