
-- Fix infinite recursion in profiles RLS policies

-- First, drop all existing conflicting policies on profiles table
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

-- Create a security definer function to get current user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create simple, non-recursive RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.get_current_user_role() = 'system_admin'
  );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    public.get_current_user_role() = 'system_admin'
  );

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (
    auth.uid() = id OR 
    public.get_current_user_role() = 'system_admin'
  );

-- Ensure the handle_new_user trigger exists for profile creation
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
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'org_owner');
  
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
    -- Create minimal profile to prevent auth failures
    INSERT INTO public.profiles (id, full_name, email, role, created_at)
    VALUES (NEW.id, user_name, NEW.email, 'org_owner', now())
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing users without profiles
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
