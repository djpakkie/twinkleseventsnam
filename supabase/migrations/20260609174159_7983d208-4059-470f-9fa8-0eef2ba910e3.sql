
CREATE TABLE public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  default_service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  archived boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.event_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_types TO authenticated;
GRANT ALL ON public.event_types TO service_role;

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active event types"
  ON public.event_types FOR SELECT
  USING (archived = false OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert event types"
  ON public.event_types FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event types"
  ON public.event_types FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event types"
  ON public.event_types FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER event_types_touch_updated_at
  BEFORE UPDATE ON public.event_types
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Link bookings to event type catalog (keep existing event_type text column for label snapshots)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS event_type_id uuid REFERENCES public.event_types(id) ON DELETE SET NULL;

-- Seed default catalog
INSERT INTO public.event_types (name, slug, sort_order) VALUES
  ('Wedding','wedding',10),
  ('Engagement Party','engagement-party',20),
  ('Traditional Wedding','traditional-wedding',30),
  ('Bridal Shower','bridal-shower',40),
  ('Baby Shower','baby-shower',50),
  ('Gender Reveal','gender-reveal',60),
  ('Birthday Party','birthday-party',70),
  ('Children''s Party','childrens-party',80),
  ('Graduation Party','graduation-party',90),
  ('Anniversary Celebration','anniversary-celebration',100),
  ('Corporate Event','corporate-event',110),
  ('Product Launch','product-launch',120),
  ('Conference','conference',130),
  ('Seminar','seminar',140),
  ('Workshop','workshop',150),
  ('Awards Ceremony','awards-ceremony',160),
  ('Gala Dinner','gala-dinner',170),
  ('Team Building Event','team-building-event',180),
  ('Networking Event','networking-event',190),
  ('Fundraiser','fundraiser',200),
  ('Charity Event','charity-event',210),
  ('Church Event','church-event',220),
  ('Youth Event','youth-event',230),
  ('Concert','concert',240),
  ('Festival','festival',250),
  ('Fashion Show','fashion-show',260),
  ('Exhibition','exhibition',270),
  ('Trade Show','trade-show',280),
  ('Funeral','funeral',290),
  ('Memorial Service','memorial-service',300),
  ('Family Gathering','family-gathering',310),
  ('Holiday Party','holiday-party',320),
  ('Year-End Function','year-end-function',330),
  ('Custom Event','custom-event',340)
ON CONFLICT (slug) DO NOTHING;
