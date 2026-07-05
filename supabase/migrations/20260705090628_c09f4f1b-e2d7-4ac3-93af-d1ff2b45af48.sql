-- Fix: Require authentication for booking submissions
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;

CREATE POLICY "Authenticated users create own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix: Remove bookings from Realtime publication to prevent any potential
-- broadcast of booking PII to non-admin subscribers. Admin dashboard will
-- refetch via query invalidation / manual refresh instead.
ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings;