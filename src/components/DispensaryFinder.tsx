import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, Clock, Phone, ExternalLink, Search, Store, Star } from "lucide-react";

interface Dispensary {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  hours: string;
  phone: string;
  website: string;
  hasDelivery: boolean;
  hasPickup: boolean;
  featuredProducts: string[];
}

// Mock dispensary data - in production, this would come from a real API
const mockDispensaries: Dispensary[] = [
  {
    id: "1",
    name: "Green Leaf Wellness",
    address: "123 Cannabis Street, Cape Town",
    distance: "1.2 km",
    rating: 4.8,
    isOpen: true,
    hours: "9:00 AM - 9:00 PM",
    phone: "+27 21 123 4567",
    website: "https://greenleaf.co.za",
    hasDelivery: true,
    hasPickup: true,
    featuredProducts: ["Blue Dream", "OG Kush", "CBD Tinctures"],
  },
  {
    id: "2",
    name: "Herbal Haven",
    address: "456 Wellness Road, Johannesburg",
    distance: "2.5 km",
    rating: 4.6,
    isOpen: true,
    hours: "10:00 AM - 8:00 PM",
    phone: "+27 11 987 6543",
    website: "https://herbalhaven.co.za",
    hasDelivery: true,
    hasPickup: false,
    featuredProducts: ["Durban Poison", "Girl Scout Cookies", "Edibles"],
  },
  {
    id: "3",
    name: "Nature's Medicine",
    address: "789 Green Avenue, Durban",
    distance: "3.8 km",
    rating: 4.9,
    isOpen: false,
    hours: "Opens at 10:00 AM",
    phone: "+27 31 456 7890",
    website: "https://naturesmedicine.co.za",
    hasDelivery: false,
    hasPickup: true,
    featuredProducts: ["Jack Herer", "Granddaddy Purple", "CBD Oils"],
  },
  {
    id: "4",
    name: "Tripple4 Store",
    address: "101 Main Street, Pretoria",
    distance: "5.2 km",
    rating: 5.0,
    isOpen: true,
    hours: "8:00 AM - 10:00 PM",
    phone: "+27 12 345 6789",
    website: "https://tripplefour.co.za",
    hasDelivery: true,
    hasPickup: true,
    featuredProducts: ["Premium Flower", "Concentrates", "Accessories"],
  },
];

const DispensaryFinder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredDispensaries = mockDispensaries.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card/80 backdrop-blur-sm border-border hover:bg-accent"
          aria-label="Find dispensaries"
        >
          <Store className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Store className="h-5 w-5" />
            Find Dispensaries
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3 pr-4">
              {filteredDispensaries.map((dispensary) => (
                <Card
                  key={dispensary.id}
                  className="p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {dispensary.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{dispensary.address}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {dispensary.distance}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-hippie-yellow text-hippie-yellow" />
                            <span className="text-xs font-medium">
                              {dispensary.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={dispensary.isOpen ? "default" : "secondary"}
                        className={
                          dispensary.isOpen
                            ? "bg-hippie-green text-white"
                            : ""
                        }
                      >
                        {dispensary.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{dispensary.hours}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {dispensary.hasDelivery && (
                        <Badge variant="outline" className="text-xs">
                          🚚 Delivery
                        </Badge>
                      )}
                      {dispensary.hasPickup && (
                        <Badge variant="outline" className="text-xs">
                          🏪 Pickup
                        </Badge>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Featured:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dispensary.featuredProducts.map((product) => (
                          <Badge
                            key={product}
                            variant="secondary"
                            className="text-xs"
                          >
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          window.open(`tel:${dispensary.phone}`, "_self")
                        }
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white"
                        onClick={() =>
                          window.open(dispensary.website, "_blank")
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredDispensaries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No dispensaries found</p>
                  <p className="text-sm mt-2">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <p className="text-xs text-muted-foreground text-center">
            📍 Showing dispensaries near you
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DispensaryFinder;
