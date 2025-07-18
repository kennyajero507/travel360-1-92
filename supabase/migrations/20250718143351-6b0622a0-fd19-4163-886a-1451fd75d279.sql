-- Fix database security issues identified in the health check

-- Step 1: Add missing search_path to all security definer functions
CREATE OR REPLACE FUNCTION public.update_organization_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_org_id_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := get_user_organization();
  END IF;
  
  IF NEW.org_id IS NULL THEN
    RAISE EXCEPTION 'User must belong to an organization to perform this action';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_safe()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'agent'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_organization_settings(p_org_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(org_id uuid, default_country text, default_currency text, default_regions jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  target_org_id uuid;
BEGIN
  target_org_id := COALESCE(p_org_id, get_user_organization());
  
  RETURN QUERY
  SELECT 
    os.org_id,
    os.default_country,
    os.default_currency,
    os.default_regions
  FROM public.organization_settings os
  WHERE os.org_id = target_org_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_data_backup()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  backup_info TEXT;
BEGIN
  backup_info := 'Backup created at: ' || now()::text;
  
  INSERT INTO public.audit_logs (
    table_name, operation, record_id, user_id, new_values
  ) VALUES (
    'system_backup', 'BACKUP', 'system', auth.uid(),
    jsonb_build_object('timestamp', now(), 'type', 'manual_backup')
  );
  
  RETURN backup_info;
END;
$function$;

CREATE OR REPLACE FUNCTION public.debug_user_auth(user_id_param uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_exists boolean, profile_exists boolean, profile_data jsonb, org_exists boolean, org_data jsonb, policies_blocking text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  target_user_id uuid;
  user_found boolean := false;
  profile_found boolean := false;
  org_found boolean := false;
  profile_info jsonb;
  org_info jsonb;
  blocking_policies text[] := '{}';
BEGIN
  target_user_id := COALESCE(user_id_param, auth.uid());
  
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id) INTO user_found;
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO profile_found;
  
  IF profile_found THEN
    SELECT to_jsonb(p.*) INTO profile_info FROM public.profiles p WHERE id = target_user_id;
    
    IF (profile_info->>'org_id') IS NOT NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM public.organizations WHERE id = (profile_info->>'org_id')::uuid
      ) INTO org_found;
      
      IF org_found THEN
        SELECT to_jsonb(o.*) INTO org_info 
        FROM public.organizations o 
        WHERE id = (profile_info->>'org_id')::uuid;
      END IF;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    user_found,
    profile_found,
    profile_info,
    org_found,
    org_info,
    blocking_policies;
END;
$function$;

CREATE OR REPLACE FUNCTION public.debug_user_profile(target_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_id uuid := COALESCE(target_user_id, auth.uid());
  result jsonb := '{}';
  user_exists boolean := false;
  profile_exists boolean := false;
  profile_data jsonb;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  IF profile_exists THEN
    SELECT to_jsonb(p.*) INTO profile_data FROM public.profiles p WHERE id = user_id;
  END IF;
  
  result := jsonb_build_object(
    'user_id', user_id,
    'user_exists_in_auth', user_exists,
    'profile_exists', profile_exists,
    'profile_data', profile_data,
    'current_auth_uid', auth.uid(),
    'timestamp', now()
  );
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.debug_auth_status(target_user_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  result jsonb := '{}';
  user_exists boolean := false;
  profile_exists boolean := false;
  profile_data jsonb;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id) INTO user_exists;
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO profile_exists;
  
  IF profile_exists THEN
    SELECT to_jsonb(p.*) INTO profile_data FROM public.profiles p WHERE id = target_user_id;
  END IF;
  
  result := jsonb_build_object(
    'user_id', target_user_id,
    'user_exists_in_auth', user_exists,
    'profile_exists', profile_exists,
    'profile_data', profile_data,
    'current_auth_uid', auth.uid(),
    'is_admin', public.is_system_admin(target_user_id),
    'timestamp', now()
  );
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_admin_activity(p_action text, p_target_type text DEFAULT NULL::text, p_target_id text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_details,
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_permission(p_user_id uuid, p_permission text, p_resource text DEFAULT NULL::text, p_action text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN := FALSE;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF user_role = 'system_admin' THEN
    RETURN TRUE;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.role_permissions 
    WHERE role = user_role 
    AND permission = p_permission
    AND (resource IS NULL OR resource = p_resource OR resource = '*')
    AND (action = p_action OR action = 'all' OR action = '*')
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_quote_summary(quote_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN '{}'::jsonb;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN (SELECT org_id FROM public.profiles WHERE id = auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_system_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.log_audit_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    table_name, operation, record_id, user_id, old_values, new_values
  )
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id::text, OLD.id::text),
    auth.uid(),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organization()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;