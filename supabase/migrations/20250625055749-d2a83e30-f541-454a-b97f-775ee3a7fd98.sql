
-- CRITICAL FIX 1: Create the missing trigger that connects handle_new_user() to auth.users
-- This is why profiles aren't being created and users see "Loading account..." forever
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CRITICAL FIX 2: Improve the handle_new_user function to be more resilient
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
  -- Extract name from metadata with better fallback logic
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract role with proper default
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'org_owner');
  
  -- Extract company name if provided
  company_name := NEW.raw_user_meta_data->>'company_name';
  
  -- Insert profile with comprehensive error handling
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
    trial_ends_at = COALESCE(EXCLUDED.trial_ends_at, profiles.trial_ends_at);
  
  -- Create organization if user is org_owner and has company_name
  IF user_role = 'org_owner' AND company_name IS NOT NULL AND company_name != '' THEN
    BEGIN
      INSERT INTO public.organizations (name, owner_id, created_at)
      VALUES (company_name, NEW.id, now())
      RETURNING id INTO org_id;
      
      -- Link profile to organization
      UPDATE public.profiles SET org_id = org_id WHERE id = NEW.id;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but don't fail the profile creation
        RAISE WARNING 'Organization creation failed for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    
    -- Create minimal profile to prevent auth failures
    INSERT INTO public.profiles (id, full_name, email, role, created_at)
    VALUES (NEW.id, COALESCE(user_name, 'User'), NEW.email, 'org_owner', now())
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- CRITICAL FIX 3: Clean up duplicate and conflicting RLS policies
-- Drop all existing policies on profiles table
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

-- Create clean, simple RLS policies using security definer function
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (
    auth.uid() = id OR 
    public.check_system_admin()
  );

-- CRITICAL FIX 4: Fix existing users without profiles
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

-- CRITICAL FIX 5: Create organizations for org_owners without organizations
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
