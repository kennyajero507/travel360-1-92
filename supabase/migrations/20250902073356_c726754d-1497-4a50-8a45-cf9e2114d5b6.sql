-- Fix critical RLS policy issues identified in security scan

-- Fix bookings table RLS policies - remove overly permissive policies
DROP POLICY IF EXISTS "Org members can manage their bookings" ON public.bookings;

-- Create proper restrictive policies for bookings
CREATE POLICY "Users can view organization bookings" 
ON public.bookings FOR SELECT 
USING (check_system_admin() OR org_id = get_user_organization());

CREATE POLICY "Users can create bookings in their organization" 
ON public.bookings FOR INSERT 
WITH CHECK (org_id = get_user_organization() AND agent_id = auth.uid());

CREATE POLICY "Users can update organization bookings" 
ON public.bookings FOR UPDATE 
USING (org_id = get_user_organization());

CREATE POLICY "Users can delete organization bookings" 
ON public.bookings FOR DELETE 
USING (org_id = get_user_organization() AND agent_id = auth.uid());

-- Fix invoices table RLS policies - remove overly permissive policies  
DROP POLICY IF EXISTS "Org members can manage their invoices" ON public.invoices;

-- Create proper restrictive policies for invoices
CREATE POLICY "Users can view organization invoices" 
ON public.invoices FOR SELECT 
USING (check_system_admin() OR organization_id = get_user_organization());

CREATE POLICY "Users can create invoices in their organization" 
ON public.invoices FOR INSERT 
WITH CHECK (organization_id = get_user_organization() AND created_by = auth.uid());

CREATE POLICY "Users can update organization invoices" 
ON public.invoices FOR UPDATE 
USING (organization_id = get_user_organization() AND created_by = auth.uid());

CREATE POLICY "Users can delete organization invoices" 
ON public.invoices FOR DELETE 
USING (organization_id = get_user_organization() AND created_by = auth.uid());

-- Fix payments table RLS policies - remove overly permissive policies
DROP POLICY IF EXISTS "Org members can manage their payments" ON public.payments;

-- Create proper restrictive policies for payments
CREATE POLICY "Users can view organization payments" 
ON public.payments FOR SELECT 
USING (check_system_admin() OR booking_id IN (
  SELECT id FROM public.bookings WHERE org_id = get_user_organization()
));

CREATE POLICY "Users can create payments for organization bookings" 
ON public.payments FOR INSERT 
WITH CHECK (booking_id IN (
  SELECT id FROM public.bookings WHERE org_id = get_user_organization()
));

CREATE POLICY "Users can update organization payments" 
ON public.payments FOR UPDATE 
USING (booking_id IN (
  SELECT id FROM public.bookings WHERE org_id = get_user_organization()
));

CREATE POLICY "Users can delete organization payments" 
ON public.payments FOR DELETE 
USING (booking_id IN (
  SELECT id FROM public.bookings WHERE org_id = get_user_organization()
));

-- Fix travel_vouchers table RLS policies - remove overly permissive policies
DROP POLICY IF EXISTS "Org members can manage their vouchers" ON public.travel_vouchers;

-- Keep the existing restrictive policies for travel_vouchers as they look good

-- Fix quote related tables RLS policies - remove overly permissive policies
DROP POLICY IF EXISTS "Org members can manage quote accommodations" ON public.quote_accommodations;
DROP POLICY IF EXISTS "Org members can manage quote excursions" ON public.quote_excursions;  
DROP POLICY IF EXISTS "Org members can manage quote markup" ON public.quote_markup;
DROP POLICY IF EXISTS "Org members can manage quote transfers" ON public.quote_transfers_new;
DROP POLICY IF EXISTS "Org members can manage quote transport" ON public.quote_transport;

-- The existing restrictive policies for quote tables look good, keep them