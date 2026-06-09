
-- Remove client-side INSERT policy on activity_log; only admins or SECURITY DEFINER can insert
DROP POLICY IF EXISTS "Authenticated insert activity" ON public.activity_log;

CREATE POLICY "Admins can insert activity"
  ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Restrict Realtime subscriptions on bookings to admins only
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can subscribe to bookings realtime" ON realtime.messages;
CREATE POLICY "Admins can subscribe to bookings realtime"
  ON realtime.messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
