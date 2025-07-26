-- Fix Function Search Path Security Issues
-- Update functions to have immutable search_path for security

CREATE OR REPLACE FUNCTION public.get_user_role_safe()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'agent'
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_if_system_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.system_admins 
    WHERE user_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_system_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.system_admins WHERE user_id = $1);
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organization()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.check_system_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT org_id FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Fix RLS policies for better data access control
-- Update quotes policies to ensure org_owners can access their organization's data
DROP POLICY IF EXISTS "Users can view organization quotes" ON public.quotes;
CREATE POLICY "Users can view organization quotes" 
ON public.quotes 
FOR SELECT 
USING (
  check_system_admin() OR 
  (org_id = get_user_organization()) OR
  (created_by = auth.uid())
);

-- Update inquiries policies
DROP POLICY IF EXISTS "Users can view organization inquiries" ON public.inquiries;
CREATE POLICY "Users can view organization inquiries" 
ON public.inquiries 
FOR SELECT 
USING (
  check_system_admin() OR 
  (org_id = get_user_organization()) OR
  (created_by = auth.uid()) OR 
  (assigned_to = auth.uid())
);

-- Update bookings policies  
DROP POLICY IF EXISTS "Users can view organization bookings" ON public.bookings;
CREATE POLICY "Users can view organization bookings" 
ON public.bookings 
FOR SELECT 
USING (
  check_system_admin() OR 
  (org_id = get_user_organization())
);

-- Update hotels policies
DROP POLICY IF EXISTS "Users can view organization hotels" ON public.hotels;
CREATE POLICY "Users can view organization hotels" 
ON public.hotels 
FOR SELECT 
USING (
  check_system_admin() OR 
  (org_id = get_user_organization())
);

-- Update clients policies
DROP POLICY IF EXISTS "Users can view organization clients" ON public.clients;
CREATE POLICY "Users can view organization clients" 
ON public.clients 
FOR SELECT 
USING (
  check_system_admin() OR 
  (org_id = get_user_organization())
);

-- Ensure profiles can view org members for system functionality
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  check_system_admin() OR
  (org_id = get_user_organization() AND org_id IS NOT NULL)
);

-- Log the security audit completion
INSERT INTO public.audit_logs (
  table_name, operation, record_id, user_id, new_values
) VALUES (
  'system_security', 'AUDIT_COMPLETE', 'security_fixes_applied', auth.uid(),
  jsonb_build_object(
    'fixes_applied', ARRAY[
      'function_search_path_secured',
      'rls_policies_updated',
      'data_access_controls_improved'
    ],
    'timestamp', now(),
    'security_level', 'enhanced'
  )
);