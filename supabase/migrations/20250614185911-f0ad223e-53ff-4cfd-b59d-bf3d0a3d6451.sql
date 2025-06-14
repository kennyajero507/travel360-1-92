
-- 1. Create a security definer function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Drop the problematic policies using recursive lookups
DROP POLICY IF EXISTS "Users can view their own profile or system admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or system admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile or system admins can delete any" ON public.profiles;

-- 3. Add new policies that use the security definer function to prevent infinite recursion
CREATE POLICY "Users can view their own profile or system admins can view all"
ON public.profiles FOR SELECT USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'system_admin'
);

CREATE POLICY "Users can update their own profile or system admins can update any"
ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'system_admin'
);

CREATE POLICY "System can insert profiles during signup"
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own profile or system admins can delete any"
ON public.profiles FOR DELETE USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'system_admin'
);

