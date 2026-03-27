
-- Delivery orders table
CREATE TABLE public.delivery_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  delivery_address text NOT NULL,
  delivery_lat numeric,
  delivery_lng numeric,
  delivery_fee numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  distance_km numeric,
  estimated_delivery_minutes integer,
  driver_notes text,
  customer_phone text,
  customer_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Delivery order items table
CREATE TABLE public.delivery_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  strain_id uuid NOT NULL REFERENCES public.tenant_strains(id),
  strain_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for delivery_orders
CREATE POLICY "Users can create own orders" ON public.delivery_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.delivery_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own pending orders" ON public.delivery_orders FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can view all orders" ON public.delivery_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all orders" ON public.delivery_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for delivery_order_items
CREATE POLICY "Users can create own order items" ON public.delivery_order_items FOR INSERT TO authenticated WITH CHECK (order_id IN (SELECT id FROM delivery_orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own order items" ON public.delivery_order_items FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM delivery_orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.delivery_order_items FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM delivery_orders WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_delivery_orders_updated_at BEFORE UPDATE ON public.delivery_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
