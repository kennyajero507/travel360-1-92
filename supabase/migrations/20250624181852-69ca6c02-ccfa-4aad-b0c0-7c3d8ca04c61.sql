
-- Create comprehensive RLS policies for all tables

-- 1. Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "System admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "System admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'system_admin'
  )
);

-- 2. Organizations table policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can manage all organizations" ON public.organizations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'system_admin'
  )
);

CREATE POLICY "Org owners can view their organization" ON public.organizations
FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND org_id = organizations.id
  )
);

CREATE POLICY "Org owners can update their organization" ON public.organizations
FOR UPDATE USING (owner_id = auth.uid());

-- 3. Inquiries table policies
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization inquiries" ON public.inquiries
FOR SELECT USING (
  org_id = get_user_organization() OR
  created_by = auth.uid() OR
  assigned_to = auth.uid()
);

CREATE POLICY "Users can create inquiries in their organization" ON public.inquiries
FOR INSERT WITH CHECK (
  org_id = get_user_organization() AND
  created_by = auth.uid()
);

CREATE POLICY "Users can update assigned inquiries" ON public.inquiries
FOR UPDATE USING (
  org_id = get_user_organization() AND
  (created_by = auth.uid() OR assigned_to = auth.uid())
);

-- 4. Quotes table policies
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization quotes" ON public.quotes
FOR SELECT USING (org_id = get_user_organization());

CREATE POLICY "Users can create quotes in their organization" ON public.quotes
FOR INSERT WITH CHECK (
  org_id = get_user_organization() AND
  created_by = auth.uid()
);

CREATE POLICY "Users can update organization quotes" ON public.quotes
FOR UPDATE USING (
  org_id = get_user_organization() AND
  created_by = auth.uid()
);

-- 5. Bookings table policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization bookings" ON public.bookings
FOR SELECT USING (org_id = get_user_organization());

CREATE POLICY "Users can create bookings in their organization" ON public.bookings
FOR INSERT WITH CHECK (
  org_id = get_user_organization() AND
  agent_id = auth.uid()
);

CREATE POLICY "Users can update organization bookings" ON public.bookings
FOR UPDATE USING (
  org_id = get_user_organization() AND
  agent_id = auth.uid()
);

-- 6. Travel vouchers table policies
ALTER TABLE public.travel_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vouchers for organization bookings" ON public.travel_vouchers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = travel_vouchers.booking_id 
    AND org_id = get_user_organization()
  )
);

CREATE POLICY "Users can create vouchers for organization bookings" ON public.travel_vouchers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = travel_vouchers.booking_id 
    AND org_id = get_user_organization()
  ) AND
  issued_by = auth.uid()
);

-- 7. Hotels table policies
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization hotels" ON public.hotels
FOR SELECT USING (org_id = get_user_organization());

CREATE POLICY "Users can create hotels in their organization" ON public.hotels
FOR INSERT WITH CHECK (
  org_id = get_user_organization() AND
  created_by = auth.uid()
);

CREATE POLICY "Users can update organization hotels" ON public.hotels
FOR UPDATE USING (
  org_id = get_user_organization() AND
  created_by = auth.uid()
);

-- 8. Clients table policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization clients" ON public.clients
FOR SELECT USING (org_id = get_user_organization());

CREATE POLICY "Users can create clients in their organization" ON public.clients
FOR INSERT WITH CHECK (
  org_id = get_user_organization() AND
  created_by = auth.uid()
);

CREATE POLICY "Users can update organization clients" ON public.clients
FOR UPDATE USING (
  org_id = get_user_organization() AND
  created_by = auth.uid()
);

-- 9. Invitations table policies
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners can manage invitations" ON public.invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = invitations.org_id AND owner_id = auth.uid()
  )
);

-- 10. Organization settings policies
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization settings" ON public.organization_settings
FOR SELECT USING (org_id = get_user_organization());

CREATE POLICY "Org owners can manage organization settings" ON public.organization_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_settings.org_id AND owner_id = auth.uid()
  )
);

-- 11. Notifications table policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- 12. System admin policies for audit logs and system tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'system_admin'
  )
);

-- 13. Role permissions policies
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can manage role permissions" ON public.role_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'system_admin'
  )
);

-- 14. Create trigger to auto-set org_id on inserts
CREATE OR REPLACE FUNCTION public.set_org_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := get_user_organization();
  END IF;
  
  IF NEW.org_id IS NULL THEN
    RAISE EXCEPTION 'User must belong to an organization to perform this action';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to relevant tables
DROP TRIGGER IF EXISTS set_org_id_on_inquiries_insert ON public.inquiries;
CREATE TRIGGER set_org_id_on_inquiries_insert
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION set_org_id_on_insert();

DROP TRIGGER IF EXISTS set_org_id_on_quotes_insert ON public.quotes;
CREATE TRIGGER set_org_id_on_quotes_insert
  BEFORE INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION set_org_id_on_insert();

DROP TRIGGER IF EXISTS set_org_id_on_bookings_insert ON public.bookings;
CREATE TRIGGER set_org_id_on_bookings_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION set_org_id_on_insert();

DROP TRIGGER IF EXISTS set_org_id_on_hotels_insert ON public.hotels;
CREATE TRIGGER set_org_id_on_hotels_insert
  BEFORE INSERT ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION set_org_id_on_insert();

DROP TRIGGER IF EXISTS set_org_id_on_clients_insert ON public.clients;
CREATE TRIGGER set_org_id_on_clients_insert
  BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION set_org_id_on_insert();
