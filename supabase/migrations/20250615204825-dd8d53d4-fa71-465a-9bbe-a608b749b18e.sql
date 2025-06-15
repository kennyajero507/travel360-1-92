
-- 1. Create a security definer function to get current user's org_id
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Create a function to check if the user is a system admin
CREATE OR REPLACE FUNCTION public.check_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin'
  );
$$;

-- 3. BOOKINGS: Only org members or system admins can access
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members manage own bookings" ON public.bookings;
CREATE POLICY "Org members manage own bookings"
  ON public.bookings
  FOR ALL
  USING (
    check_system_admin() OR
    org_id = get_user_organization()
  );

-- 4. CLIENTS: Only org members or system admins can access
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members manage own clients" ON public.clients;
CREATE POLICY "Org members manage own clients"
  ON public.clients
  FOR ALL
  USING (
    check_system_admin() OR
    org_id = get_user_organization()
  );

-- 5. HOTELS: Only org members or system admins can access
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members manage own hotels" ON public.hotels;
CREATE POLICY "Org members manage own hotels"
  ON public.hotels
  FOR ALL
  USING (
    check_system_admin() OR
    org_id = get_user_organization()
  );

-- 6. INQUIRIES: Only org members or system admins can access
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members manage own inquiries" ON public.inquiries;
CREATE POLICY "Org members manage own inquiries"
  ON public.inquiries
  FOR ALL
  USING (
    check_system_admin() OR
    org_id = get_user_organization()
  );

-- (You may apply this pattern for other tables with org_id if desired)
