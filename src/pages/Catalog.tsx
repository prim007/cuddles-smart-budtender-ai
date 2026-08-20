import { ExternalLink, ShoppingBag, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import cuddlesImage from "@/assets/cuddles.png";

const WHATSAPP_CATALOG_URL = "https://wa.me/c/27645436734";
const WHATSAPP_CHAT_URL = "https://wa.me/27645436734";

const Catalog = () => {
  return (
    <>
      <SEO
        title="Browse Our Catalog | Cuddles AI"
        description="Browse our full product catalog on WhatsApp Business. Order directly through WhatsApp for fast delivery."
        url="/catalog"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cuddles
            </Link>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-lg">
                <img src={cuddlesImage} alt="Cuddles AI" className="w-full h-full object-cover" />
              </div>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse Our Catalog
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Explore our full product range on WhatsApp Business. Chat with us directly to place orders and get personalized recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white font-display font-semibold rounded-xl px-8 py-6 text-lg shadow-lg"
                onClick={() => window.open(WHATSAPP_CATALOG_URL, "_blank")}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                View Full Catalog
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 py-6 text-lg border-border"
                onClick={() => window.open(WHATSAPP_CHAT_URL, "_blank")}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-12">
            How to Order
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Chat with Cuddles",
                description: "Get AI-powered strain recommendations tailored to your needs.",
                icon: "💬",
              },
              {
                step: "2",
                title: "Browse the Catalog",
                description: "View our full product range with pricing on WhatsApp Business.",
                icon: "📋",
              },
              {
                step: "3",
                title: "Place Your Order",
                description: "Message us directly on WhatsApp to order. Fast and easy!",
                icon: "✅",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-semibold text-primary mb-2">STEP {item.step}</div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Ready to Order?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Open our WhatsApp catalog to see all available products with descriptions and pricing.
            </p>
            <Button
              size="lg"
              className="bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white font-display font-semibold rounded-xl px-8 py-6 text-lg shadow-lg"
              onClick={() => window.open(WHATSAPP_CATALOG_URL, "_blank")}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Open WhatsApp Catalog
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Catalog;
