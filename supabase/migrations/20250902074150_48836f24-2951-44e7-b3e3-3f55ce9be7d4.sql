
-- Fix the inquiries table ID column issue
ALTER TABLE public.inquiries ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure all tables have proper org_id triggers
CREATE OR REPLACE FUNCTION public.set_org_id_from_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := (SELECT org_id FROM public.profiles WHERE id = auth.uid());
  END IF;
  
  IF NEW.org_id IS NULL THEN
    RAISE EXCEPTION 'User must belong to an organization to perform this action';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for org_id population
DROP TRIGGER IF EXISTS set_org_id_inquiries ON public.inquiries;
CREATE TRIGGER set_org_id_inquiries
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_org_id_from_user();

DROP TRIGGER IF EXISTS set_org_id_quotes ON public.quotes;
CREATE TRIGGER set_org_id_quotes
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_org_id_from_user();

DROP TRIGGER IF EXISTS set_org_id_bookings ON public.bookings;
CREATE TRIGGER set_org_id_bookings
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_org_id_from_user();

DROP TRIGGER IF EXISTS set_org_id_hotels ON public.hotels;
CREATE TRIGGER set_org_id_hotels
  BEFORE INSERT ON public.hotels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_org_id_from_user();

-- Fix RLS policies for inquiries
DROP POLICY IF EXISTS "Users can create inquiries in their organization" ON public.inquiries;
CREATE POLICY "Users can create inquiries in their organization" 
ON public.inquiries FOR INSERT 
WITH CHECK (org_id = get_user_organization());

-- Fix RLS policies for quotes
DROP POLICY IF EXISTS "Users can create quotes in their organization" ON public.quotes;
CREATE POLICY "Users can create quotes in their organization" 
ON public.quotes FOR INSERT 
WITH CHECK (org_id = get_user_organization());

-- Fix RLS policies for bookings
DROP POLICY IF EXISTS "Users can create bookings in their organization" ON public.bookings;
CREATE POLICY "Users can create bookings in their organization" 
ON public.bookings FOR INSERT 
WITH CHECK (org_id = get_user_organization());

-- Fix RLS policies for hotels
DROP POLICY IF EXISTS "Users can create hotels in their organization" ON public.hotels;
CREATE POLICY "Users can create hotels in their organization" 
ON public.hotels FOR INSERT 
WITH CHECK (org_id = get_user_organization());
