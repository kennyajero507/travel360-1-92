
-- Comprehensive authentication fix - Database cleanup and policy restructuring

-- Step 1: Drop ALL existing problematic policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile or system admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or system admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile or system admins can delete any" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Step 2: Create a STABLE security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 3: Create simple, non-recursive RLS policies
CREATE POLICY "Allow users to view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Step 4: Add system admin override policies (separate from user policies)
CREATE POLICY "Allow system admin full access" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'system_admin');

-- Step 5: Ensure the handle_new_user trigger is properly configured
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
BEGIN
  -- Extract user data with better fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'org_owner');
  
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
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and create minimal profile
    RAISE WARNING 'Profile creation failed for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
    
    -- Attempt to create minimal profile as fallback
    INSERT INTO public.profiles (id, full_name, email, role, created_at)
    VALUES (NEW.id, user_name, NEW.email, 'org_owner', now())
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Fix any existing users without profiles
INSERT INTO public.profiles (id, full_name, email, role, created_at, trial_ends_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name', 
    split_part(au.email, '@', 1)
  ) as full_name,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'org_owner') as role,
  au.created_at,
  NOW() + interval '14 days' as trial_ends_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create debug function for troubleshooting
CREATE OR REPLACE FUNCTION public.debug_user_profile(target_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid := COALESCE(target_user_id, auth.uid());
  result jsonb := '{}';
  user_exists boolean := false;
  profile_exists boolean := false;
  profile_data jsonb;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  -- Get profile data if exists
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
$$;
