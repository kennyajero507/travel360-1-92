
-- AUDIT FIX 1: Clean up duplicate and conflicting RLS policies
-- Drop all existing conflicting policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile or system admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or system admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile or system admins can delete any" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own or all profiles if admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own or any profile if admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own or any profile if admin" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their profile or admins all" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their profile or admins all" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile or admins" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "System admins can view all profiles" ON public.profiles;

-- Create clean, simple RLS policies
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

-- AUDIT FIX 2: Ensure the critical trigger exists
-- This is what creates profiles automatically when users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- AUDIT FIX 3: Fix any existing users without profiles
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

-- AUDIT FIX 4: Create organizations for org_owners without organizations
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
    -- Create organization with user's name as company name
    INSERT INTO public.organizations (name, owner_id, created_at)
    VALUES (
      COALESCE(profile_record.full_name, 'My Company') || '''s Organization',
      profile_record.id,
      now()
    )
    RETURNING id INTO new_org_id;
    
    -- Link profile to new organization
    UPDATE public.profiles 
    SET org_id = new_org_id 
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- AUDIT FIX 5: Ensure organizations table has proper RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Clean up any duplicate organization policies
DROP POLICY IF EXISTS "System admins can manage all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Org owners can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Org owners can update their organization" ON public.organizations;

-- Create clean organization policies
CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'system_admin' OR org_id = organizations.id)
    )
  );

CREATE POLICY "organizations_update" ON public.organizations
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    public.check_system_admin()
  );

CREATE POLICY "organizations_insert" ON public.organizations
  FOR INSERT WITH CHECK (
    owner_id = auth.uid() OR
    public.check_system_admin()
  );

CREATE POLICY "organizations_delete" ON public.organizations
  FOR DELETE USING (
    owner_id = auth.uid() OR
    public.check_system_admin()
  );
