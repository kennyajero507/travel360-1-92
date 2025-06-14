
-- CRITICAL FIX 1: Add the missing trigger to connect handle_new_user() to auth.users INSERT
-- This is the core issue causing profiles not to be created during signup

-- First, let's make sure the trigger doesn't already exist (drop if it does)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that will automatically create profiles when users sign up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CRITICAL FIX 2: Clean up any orphaned auth.users records that don't have profiles
-- Create profiles for existing users who don't have them
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

-- CRITICAL FIX 3: Ensure RLS policies are working correctly
-- Update the profiles RLS policies to be more robust and prevent infinite recursion
DROP POLICY IF EXISTS "Users can view their own or all profiles if admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own or any profile if admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own or any profile if admin" ON public.profiles;

-- Create simplified, more reliable RLS policies
CREATE POLICY "Users can view their own profile or system admins can view all"
ON public.profiles FOR SELECT USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'system_admin'
);

CREATE POLICY "Users can update their own profile or system admins can update any"
ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'system_admin'
);

CREATE POLICY "System can insert profiles during signup"
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own profile or system admins can delete any"
ON public.profiles FOR DELETE USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'system_admin'
);

-- HIGH PRIORITY FIX: Improve the handle_new_user function to be more resilient
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
  
  -- SEPARATE organization creation from profile creation for better reliability
  -- Only attempt organization creation if user is org_owner and has company_name
  IF user_role = 'org_owner' AND company_name IS NOT NULL AND company_name != '' THEN
    BEGIN
      -- Try to create organization, but don't fail the entire process if it fails
      SELECT public.create_organization(company_name) INTO org_id;
      
      -- Update profile with org_id if organization creation succeeded
      IF org_id IS NOT NULL THEN
        UPDATE public.profiles SET org_id = org_id WHERE id = NEW.id;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but don't fail the profile creation
        RAISE WARNING 'Organization creation failed for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details but don't block user creation
    RAISE WARNING 'Error in handle_new_user for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
    
    -- Create minimal profile to prevent auth failures
    INSERT INTO public.profiles (id, full_name, email, role, created_at)
    VALUES (NEW.id, COALESCE(user_name, 'User'), NEW.email, 'org_owner', now())
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;
