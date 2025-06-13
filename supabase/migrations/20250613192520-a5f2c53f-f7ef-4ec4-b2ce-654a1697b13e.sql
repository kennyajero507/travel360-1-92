
-- Phase 3: RLS Security Implementation (Incremental)
-- Only create policies that don't already exist

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "System admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org owners can view org profiles" ON public.profiles;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "System admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'system_admin'
  )
);

CREATE POLICY "Org owners can view org profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles user_profile 
    WHERE user_profile.id = auth.uid() 
    AND user_profile.role IN ('org_owner', 'system_admin')
    AND user_profile.org_id = profiles.org_id
  )
);

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate organization policies
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Org owners can update their organization" ON public.organizations;

CREATE POLICY "Users can view their organization" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT org_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Org owners can update their organization" ON public.organizations
FOR UPDATE USING (
  id IN (
    SELECT org_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('org_owner', 'system_admin')
  )
);

-- Enable RLS on quotes table
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate quotes policies
DROP POLICY IF EXISTS "Users can view org quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can create quotes" ON public.quotes;

CREATE POLICY "Users can view org quotes" ON public.quotes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      role = 'system_admin' OR
      org_id IN (
        SELECT p2.org_id FROM public.profiles p2 
        WHERE p2.id = quotes.created_by::uuid
      )
    )
  )
);

CREATE POLICY "Users can create quotes" ON public.quotes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('system_admin', 'org_owner', 'tour_operator', 'agent')
  )
);

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate bookings policies
DROP POLICY IF EXISTS "Users can view org bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

CREATE POLICY "Users can view org bookings" ON public.bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      role = 'system_admin' OR
      org_id IN (
        SELECT p2.org_id FROM public.profiles p2 
        WHERE p2.id = bookings.agent_id::uuid
      )
    )
  )
);

CREATE POLICY "Users can create bookings" ON public.bookings
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('system_admin', 'org_owner', 'tour_operator', 'agent')
  )
);
