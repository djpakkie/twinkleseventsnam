
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.booking_status AS ENUM ('pending', 'quoted', 'confirmed', 'completed', 'cancelled');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + assign role on signup (admin for djpakkie@gmail.com)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));

  IF lower(NEW.email) = 'djpakkie@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Services catalog
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  per_guest_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_guests INT DEFAULT 10,
  max_guests INT DEFAULT 500,
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active services" ON public.services FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  event_date DATE NOT NULL,
  venue TEXT,
  guest_count INT NOT NULL DEFAULT 0,
  budget_range TEXT,
  special_requirements TEXT,
  estimated_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  addons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO anon;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create a booking" ON public.bookings FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Customers update own bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed services (N$)
INSERT INTO public.services (slug, name, tagline, description, base_price, per_guest_price, min_guests, max_guests, features, sort_order) VALUES
('wedding-decor', 'Wedding Décor', 'Romantic · Editorial', 'Full ceremony and reception styling — florals, draping, lighting, and tablescapes designed around your love story.', 35000, 450, 30, 400, '["Floral arch & aisle styling","Bridal table & guest tablescapes","Ambient lighting","Lead coordinator","Setup & strike"]'::jsonb, 1),
('corporate-events', 'Corporate Events', 'Architectural · Brand-forward', 'Galas, launches, conferences and brand activations with stage design, AV, and branded environments.', 45000, 550, 40, 600, '["Stage & backdrop design","Branded signage","Architectural lighting","AV & sound","On-site event manager"]'::jsonb, 2),
('birthday-parties', 'Birthday Parties', 'Playful · Personal', 'Milestone celebrations from kids'' wonderlands to glamorous adult soirées — themed décor, props and entertainment.', 12000, 280, 15, 200, '["Themed décor & balloons","Custom backdrop","Cake table styling","Lighting & playlist","Photo moment"]'::jsonb, 3),
('baby-showers', 'Baby Showers', 'Soft · Intimate', 'Warm, considered styling for mama-to-be — soft palettes, dessert tables, and keepsake touches.', 8000, 220, 10, 80, '["Dessert table styling","Floral centrepieces","Gift & wishes table","Photo backdrop","Coordinator on the day"]'::jsonb, 4),
('custom-packages', 'Custom Packages', 'Bespoke · Limitless', 'Anniversaries, engagements, cultural celebrations — anything we haven''t named. Built from the ground up around you.', 20000, 400, 20, 500, '["Custom design concept","Bespoke moodboard","Vendor curation","Full production","Dedicated stylist"]'::jsonb, 5);
