
-- COMPREHENSIVE AUTH FIX: Address all authentication and workspace initialization issues

-- STEP 1: Ensure the profile creation trigger exists and works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_name text;
  user_role text;
  company_name text;
  org_id uuid;
BEGIN
  -- Extract user data with comprehensive fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'org_owner');
  company_name := NEW.raw_user_meta_data->>'company_name';
  
  -- Create profile immediately with error handling
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role, 
    created_at,
    trial_ends_at
  )
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    user_role,
    now(),
    now() + interval '14 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();
  
  -- Create organization for org_owners
  IF user_role = 'org_owner' THEN
    BEGIN
      INSERT INTO public.organizations (name, owner_id, created_at)
      VALUES (
        COALESCE(company_name, user_name || '''s Organization'),
        NEW.id,
        now()
      )
      RETURNING id INTO org_id;
      
      -- Link profile to organization
      UPDATE public.profiles 
      SET org_id = org_id, updated_at = now()
      WHERE id = NEW.id;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Don't fail profile creation if org creation fails
        RAISE WARNING 'Organization creation failed for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ensure we always create a minimal profile
    INSERT INTO public.profiles (id, full_name, email, role, created_at)
    VALUES (NEW.id, user_name, NEW.email, 'org_owner', now())
    ON CONFLICT (id) DO NOTHING;
    
    RAISE WARNING 'Profile creation had errors for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 2: Clean up all conflicting RLS policies and create clean ones
-- Drop all existing profile policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or system admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or system admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile or system admins can delete any" ON public.profiles;

-- Create simple, non-conflicting RLS policies
CREATE POLICY "profiles_can_view_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

CREATE POLICY "profiles_can_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "profiles_can_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

CREATE POLICY "profiles_can_delete_own" ON public.profiles
  FOR DELETE USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

-- STEP 3: Fix organizations policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update" ON public.organizations;
DROP POLICY IF EXISTS "organizations_delete" ON public.organizations;

CREATE POLICY "orgs_can_view_own" ON public.organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR
    public.check_system_admin() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND org_id = organizations.id
    )
  );

CREATE POLICY "orgs_can_insert_own" ON public.organizations
  FOR INSERT WITH CHECK (
    owner_id = auth.uid() OR
    public.check_system_admin()
  );

CREATE POLICY "orgs_can_update_own" ON public.organizations
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    public.check_system_admin()
  );

CREATE POLICY "orgs_can_delete_own" ON public.organizations
  FOR DELETE USING (
    owner_id = auth.uid() OR
    public.check_system_admin()
  );

-- STEP 4: Fix any existing users without profiles
INSERT INTO public.profiles (id, full_name, email, role, created_at, trial_ends_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'org_owner') as role,
  au.created_at,
  NOW() + interval '14 days' as trial_ends_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- STEP 5: Create organizations for org_owners without them
DO $$
DECLARE
  profile_record RECORD;
  new_org_id uuid;
BEGIN
  FOR profile_record IN 
    SELECT id, full_name, email 
    FROM public.profiles 
    WHERE role = 'org_owner' AND org_id IS NULL
  LOOP
    INSERT INTO public.organizations (name, owner_id, created_at)
    VALUES (
      COALESCE(profile_record.full_name, 'My Company') || '''s Organization',
      profile_record.id,
      now()
    )
    RETURNING id INTO new_org_id;
    
    UPDATE public.profiles 
    SET org_id = new_org_id, updated_at = now()
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- STEP 6: Add debugging function for auth issues
CREATE OR REPLACE FUNCTION public.debug_user_auth(user_id_param uuid DEFAULT NULL)
RETURNS TABLE(
  user_exists boolean,
  profile_exists boolean,
  profile_data jsonb,
  org_exists boolean,
  org_data jsonb,
  policies_blocking text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id) INTO user_found;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO profile_found;
  
  -- Get profile data if exists
  IF profile_found THEN
    SELECT to_jsonb(p.*) INTO profile_info FROM public.profiles p WHERE id = target_user_id;
    
    -- Check if org exists
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
$$;
