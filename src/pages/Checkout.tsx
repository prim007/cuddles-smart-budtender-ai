import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  ArrowLeft,
  MapPin,
  Truck,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CreditCard,
} from "lucide-react";

// Tripple444 shop coordinates (Cape Town area)
const SHOP_LAT = -33.9249;
const SHOP_LNG = 18.4241;

const calculateDistance = (lat: number, lng: number): number => {
  const R = 6371;
  const dLat = ((lat - SHOP_LAT) * Math.PI) / 180;
  const dLng = ((lng - SHOP_LNG) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((SHOP_LAT * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getDeliveryFee = (km: number): number => {
  if (km <= 5) return 30;
  if (km <= 10) return 50;
  if (km <= 20) return 80;
  if (km <= 40) return 120;
  return 180;
};

const getEstimatedTime = (km: number): number => {
  if (km <= 5) return 20;
  if (km <= 10) return 35;
  if (km <= 20) return 50;
  return 75;
};

const Checkout = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [manualBand, setManualBand] = useState<number | null>(null);

  // Same fee schedule as the GPS calculation, offered as a manual fallback
  // when the browser can't or won't share a location.
  const DELIVERY_BANDS = [
    { label: "Within 5 km of Cape Town city centre", fee: 30, km: 2.5, eta: 20 },
    { label: "5–10 km from Cape Town city centre", fee: 50, km: 7.5, eta: 35 },
    { label: "10–20 km from Cape Town city centre", fee: 80, km: 15, eta: 50 },
    { label: "20–40 km from Cape Town city centre", fee: 120, km: 30, eta: 75 },
    { label: "More than 40 km away", fee: 180, km: 45, eta: 75 },
  ];

  const resetDelivery = () => {
    setDeliveryFee(null);
    setDistanceKm(null);
    setEstimatedTime(null);
    setCoords(null);
    setManualBand(null);
  };

  const selectManualBand = (index: number) => {
    const band = DELIVERY_BANDS[index];
    setManualBand(index);
    setCoords(null);
    setDistanceKm(band.km);
    setDeliveryFee(band.fee);
    setEstimatedTime(band.eta);
    setDeliveryError(null);
  };

  const calculateDelivery = () => {
    if (!address.trim()) {
      toast({ title: "Enter address", description: "Please enter a delivery address.", variant: "destructive" });
      return;
    }
    resetDelivery();
    setDeliveryError(null);

    // Delivery pricing is distance-based, so it requires a real device location.
    // If we can't get one we say so — we never guess a fee, distance or ETA.
    if (!("geolocation" in navigator)) {
      setDeliveryError(
        "Your browser can't share a location. Choose your delivery area below instead — the fee is the same."
      );
      return;
    }

    setIsCalculating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const km = calculateDistance(pos.coords.latitude, pos.coords.longitude);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDistanceKm(Math.round(km * 10) / 10);
        setDeliveryFee(getDeliveryFee(km));
        setEstimatedTime(getEstimatedTime(km));
        setIsCalculating(false);
      },
      (err) => {
        setIsCalculating(false);
        setDeliveryError(
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked. Choose your delivery area below instead — the fee is the same."
            : "We couldn't confirm your location. Choose your delivery area below instead — the fee is the same."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const total = deliveryFee == null ? null : subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to place an order.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!address.trim() || !customerName.trim() || !customerPhone.trim()) {
      toast({ title: "Missing info", description: "Please fill in all delivery details.", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Empty cart", description: "Add items to your cart first.", variant: "destructive" });
      return;
    }
    if (deliveryFee == null || distanceKm == null || estimatedTime == null || total == null) {
      toast({ title: "Delivery fee required", description: "Confirm your location or choose your delivery area before placing the order.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("delivery_orders")
        .insert({
          user_id: user.id,
          delivery_address: address,
          delivery_lat: coords?.lat ?? null,
          delivery_lng: coords?.lng ?? null,
          delivery_fee: deliveryFee,
          subtotal,
          total,
          distance_km: distanceKm,
          estimated_delivery_minutes: estimatedTime,
          driver_notes: notes || null,
          customer_phone: customerPhone,
          customer_name: customerName,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        strain_id: item.strainId,
        strain_name: item.strainName,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("delivery_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast({ title: "Order placed! 🎉", description: `Order confirmed. Estimated delivery: ${estimatedTime} mins.` });
      navigate(`/orders/${order.id}`);
    } catch (error: any) {
      console.error("Order error:", error);
      toast({ title: "Order failed", description: "We couldn't place your order. Please try again or contact support.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <SEO title="Checkout — Cannabis Delivery" description="Securely complete your cannabis order. Choose delivery, enter your address, and pay with PayFast for same-day delivery in South Africa." url="/checkout" noindex />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse our menu to add items.</p>
            <Link to="/shop">
              <Button className="rounded-xl">Browse Menu</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Checkout — Cannabis Delivery" description="Securely complete your cannabis order. Choose delivery, enter your address, and pay with PayFast for same-day delivery in South Africa." url="/checkout" noindex />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Order ({itemCount} items)
              </h2>
              {items.map((item) => (
                <div
                  key={item.strainId}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.strainName}</h3>
                    <p className="text-sm text-muted-foreground">{item.strainType}</p>
                    <p className="text-sm font-medium text-primary">R{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-lg"
                      aria-label={`Decrease quantity of ${item.strainName}`}
                      onClick={() => updateQuantity(item.strainId, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" aria-hidden="true" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-lg"
                      aria-label={`Increase quantity of ${item.strainName}`}
                      onClick={() => updateQuantity(item.strainId, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="font-bold text-foreground w-20 text-right">
                    R{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-11 w-11"
                    aria-label={`Remove ${item.strainName} from cart`}
                    onClick={() => removeItem(item.strainId)}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}

              {/* Delivery details */}
              <div className="mt-8 space-y-4">
                <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Details
                </h2>
                <Input
                  placeholder="Your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Phone number (e.g. 0712345678)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Delivery address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    resetDelivery();
                    setDeliveryError(null);
                  }}
                  className="rounded-xl"
                />
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={calculateDelivery}
                  disabled={isCalculating}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {isCalculating ? "Confirming location..." : "Calculate Delivery Fee"}
                </Button>
                {deliveryError && (
                  <div className="space-y-2">
                    <p role="alert" className="text-sm text-destructive">
                      {deliveryError}
                    </p>
                    <div className="grid gap-2" role="group" aria-label="Choose your delivery area">
                      {DELIVERY_BANDS.map((band, i) => (
                        <Button
                          key={band.label}
                          type="button"
                          variant={manualBand === i ? "default" : "outline"}
                          className="rounded-xl justify-between h-auto py-3"
                          onClick={() => selectManualBand(i)}
                        >
                          <span className="text-left text-sm">{band.label}</span>
                          <span className="font-semibold ml-3">R{band.fee}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <Textarea
                  placeholder="Driver notes (optional — gate code, landmarks, etc.)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl"
                  rows={2}
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl bg-card border border-border p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Order Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="font-medium text-foreground">
                      {deliveryFee != null ? `R${deliveryFee.toFixed(2)}` : "—"}
                    </span>
                  </div>
                  {distanceKm != null && (
                    <p className="text-xs text-muted-foreground">
                      📍 {distanceKm} km · Est. {estimatedTime} min delivery
                    </p>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary text-xl">
                      {total != null ? `R${total.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full rounded-xl py-6 text-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-semibold"
                  disabled={isSubmitting || deliveryFee == null || total == null}
                  onClick={handlePlaceOrder}
                >
                  {isSubmitting ? (
                    "Placing order..."
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {total != null ? `Place Order · R${total.toFixed(2)}` : "Place Order"}
                    </>
                  )}
                </Button>
                {deliveryFee == null && (
                  <p className="text-xs text-muted-foreground text-center">
                    Confirm your location to see the delivery fee and total
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  💳 Cash on delivery · No prepayment needed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
