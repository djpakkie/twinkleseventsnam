
-- Inventory
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  current_quantity integer NOT NULL DEFAULT 0,
  minimum_quantity integer NOT NULL DEFAULT 0,
  unit text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage inventory" ON public.inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER inventory_touch BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Quotations
CREATE TYPE public.quotation_status AS ENUM ('pending','sent','approved','rejected','converted','expired');
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text NOT NULL UNIQUE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status public.quotation_status NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage quotations" ON public.quotations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER quotations_touch BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Invoices
CREATE TYPE public.invoice_status AS ENUM ('draft','unpaid','partial','paid','overdue','cancelled');
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'unpaid',
  due_date date,
  issued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER invoices_touch BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Activity log
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read activity" ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert activity" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seed sample data
INSERT INTO public.inventory (name, category, current_quantity, minimum_quantity, unit) VALUES
  ('Gold Chiavari Chairs','Seating',45,60,'units'),
  ('Round Banquet Tables','Tables',18,12,'units'),
  ('Cream Linen Tablecloths','Linens',8,20,'units'),
  ('LED Uplights','Lighting',24,15,'units'),
  ('Champagne Flutes','Glassware',60,100,'units'),
  ('White Silk Drapes','Decor',3,8,'panels');
