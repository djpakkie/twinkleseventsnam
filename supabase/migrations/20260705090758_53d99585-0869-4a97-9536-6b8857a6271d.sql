-- Clients directory
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  company_name text,
  phone text,
  alt_phone text,
  email text,
  physical_address text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX clients_name_idx ON public.clients (lower(first_name), lower(last_name));
CREATE INDEX clients_email_idx ON public.clients (lower(email));
CREATE INDEX clients_phone_idx ON public.clients (phone);

CREATE TRIGGER clients_touch
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Link client to bookings / quotations / invoices
ALTER TABLE public.bookings
  ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX bookings_client_id_idx ON public.bookings (client_id);

ALTER TABLE public.quotations
  ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX quotations_client_id_idx ON public.quotations (client_id);

ALTER TABLE public.invoices
  ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX invoices_client_id_idx ON public.invoices (client_id);