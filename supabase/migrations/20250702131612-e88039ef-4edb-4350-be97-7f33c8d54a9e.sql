-- CRITICAL FIX: Eliminate infinite recursion in profiles table RLS policies

-- Step 1: Drop all existing problematic RLS policies on profiles table
DROP POLICY IF EXISTS "System admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_can_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_can_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_can_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_can_view_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Step 2: Create a safe security definer function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Direct query to auth.uid() without causing recursion
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'agent'
  );
$$;

-- Step 3: Create a function to check if current user is system admin
CREATE OR REPLACE FUNCTION public.is_current_user_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'system_admin'
    LIMIT 1
  );
$$;

-- Step 4: Create simple, non-recursive RLS policies
CREATE POLICY "profiles_select_safe"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Users can see their own profile OR system admins can see all
  id = auth.uid() OR public.is_current_user_system_admin()
);

CREATE POLICY "profiles_insert_safe"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_safe"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR public.is_current_user_system_admin()
)
WITH CHECK (
  id = auth.uid() OR public.is_current_user_system_admin()
);

CREATE POLICY "profiles_delete_safe"
ON public.profiles FOR DELETE
TO authenticated
USING (
  id = auth.uid() OR public.is_current_user_system_admin()
);

-- Step 5: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Update the get_user_organization function to be more robust
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;