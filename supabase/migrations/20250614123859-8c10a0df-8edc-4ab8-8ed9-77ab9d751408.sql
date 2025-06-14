
-- Remove broken or duplicate RLS policies on `profiles` table
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Enable RLS on the profiles table (in case it was disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can select (view) only their own profile, or if they're a system_admin
CREATE POLICY "Authenticated users can view their profile or admins all"
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'system_admin'
  );

-- Authenticated users can update only their own profile, or if they're a system_admin
CREATE POLICY "Authenticated users can update their profile or admins all"
  ON public.profiles
  FOR UPDATE
  USING (
    id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'system_admin'
  );

-- Authenticated users can insert their own profile row only
CREATE POLICY "Authenticated users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow system admins to delete any profile, otherwise users can delete only their own
CREATE POLICY "Users can delete their own profile or admins"
  ON public.profiles
  FOR DELETE
  USING (
    id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'system_admin'
  );
