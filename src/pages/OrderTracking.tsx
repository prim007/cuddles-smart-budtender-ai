import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Truck,
  Phone,
} from "lucide-react";

const STATUS_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("id", orderId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_order_items")
        .select("*")
        .eq("order_id", orderId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === order?.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found.</p>
          <Link to="/shop">
            <Button className="rounded-xl">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Order Tracking" description="Track your cannabis delivery in real time — see order confirmation, preparation, dispatch, and arrival updates from Tripple444." url="/order-tracking" noindex />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          {/* Success banner */}
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 mb-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Order Placed!
            </h1>
            <p className="text-muted-foreground">
              Estimated delivery: <strong>{order.estimated_delivery_minutes} minutes</strong>
            </p>
          </div>

          {/* Status tracker */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= statusIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs text-center ${
                        isActive ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex mt-2 px-5">
              {STATUS_STEPS.slice(0, -1).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full mx-1 ${
                    i < statusIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Order details */}
          <div className="space-y-4">
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-2">
                {orderItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.strain_name} × {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      R{Number(item.total_price).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R{Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery ({order.distance_km} km)</span>
                    <span>R{Number(order.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>Total</span>
                    <span className="text-primary">R{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h2>
              <p className="text-sm text-foreground">{order.delivery_address}</p>
              {order.driver_notes && (
                <p className="text-xs text-muted-foreground mt-1">📝 {order.driver_notes}</p>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Need help?</p>
                <p className="text-xs text-muted-foreground">Contact us on WhatsApp</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => window.open("https://wa.me/27645436734", "_blank")}
              >
                <Phone className="w-4 h-4 mr-1" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
