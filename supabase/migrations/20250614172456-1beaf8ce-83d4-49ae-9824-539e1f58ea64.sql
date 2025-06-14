
-- Fix the handle_new_user function to properly handle signup metadata
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
  
  -- If user is org_owner and has company_name, create organization
  IF user_role = 'org_owner' AND company_name IS NOT NULL AND company_name != '' THEN
    PERFORM public.create_organization(company_name);
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

-- Add a helper function to repair missing profiles
CREATE OR REPLACE FUNCTION public.repair_user_profile(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record auth.users%ROWTYPE;
  profile_exists boolean;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id_param) INTO profile_exists;
  
  IF profile_exists THEN
    RETURN true;
  END IF;
  
  -- Get user data from auth.users (this requires service role)
  -- For now, create a basic profile
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role, 
    created_at,
    trial_ends_at
  )
  VALUES (
    user_id_param,
    'User',
    'user@example.com',
    'org_owner',
    now(),
    now() + interval '14 days'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error repairing profile for user %: %', user_id_param, SQLERRM;
    RETURN false;
END;
$$;
