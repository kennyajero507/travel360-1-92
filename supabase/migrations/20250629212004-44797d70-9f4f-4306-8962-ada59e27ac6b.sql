
-- COMPLETE AUTHENTICATION SYSTEM CLEANUP AND REBUILD

-- Step 1: Drop ALL existing problematic policies on profiles table
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow system admin full access" ON public.profiles;
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

-- Step 2: Drop the problematic recursive function
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Step 3: Create system_admins table for admin management
CREATE TABLE IF NOT EXISTS public.system_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS on system_admins
ALTER TABLE public.system_admins ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ultra-simple, non-recursive RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Step 5: Simple admin policies for system_admins table
CREATE POLICY "system_admins_select" ON public.system_admins
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS(SELECT 1 FROM public.system_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "system_admins_manage" ON public.system_admins
  FOR ALL USING (
    EXISTS(SELECT 1 FROM public.system_admins WHERE user_id = auth.uid())
  );

-- Step 6: Create a simple helper function for admin check (non-recursive)
CREATE OR REPLACE FUNCTION public.is_system_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(SELECT 1 FROM public.system_admins WHERE user_id = $1);
$$;

-- Step 7: Improve the handle_new_user trigger for more reliability
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
  -- Extract user data with fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'org_owner');
  
  -- Insert profile with simple error handling
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
    -- Log error but don't fail the user creation
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 8: Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Create a simple debug function
CREATE OR REPLACE FUNCTION public.debug_auth_status(target_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
  user_exists boolean := false;
  profile_exists boolean := false;
  profile_data jsonb;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id) INTO user_exists;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO profile_exists;
  
  -- Get profile data if exists
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
$$;
