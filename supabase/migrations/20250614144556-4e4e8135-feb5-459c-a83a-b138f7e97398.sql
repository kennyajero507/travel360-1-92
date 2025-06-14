
-- Step 1: Add org_id to inquiries table for proper data scoping
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS org_id UUID;

-- Add a foreign key constraint to organizations table for data integrity
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_inquiries_org') THEN
      ALTER TABLE public.inquiries ADD CONSTRAINT fk_inquiries_org FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
   END IF;
END;
$$;


-- Step 2: Backfill org_id for existing inquiries, safely skipping non-UUID creators
UPDATE public.inquiries i
SET org_id = (
  SELECT p.org_id
  FROM public.profiles p
  WHERE p.id = i.created_by::uuid
)
WHERE i.org_id IS NULL 
  AND i.created_by IS NOT NULL
  AND i.created_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';


-- Step 3: Fix for profiles table RLS policies to prevent infinite recursion
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Authenticated users can view their profile or admins all" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their profile or admins all" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile or admins" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own or all profiles if admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own or any profile if admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own or any profile if admin" ON public.profiles;


-- Re-create policies using the get_user_role() security definer function
CREATE POLICY "Users can view their own or all profiles if admin"
ON public.profiles FOR SELECT USING (id = auth.uid() OR public.get_user_role() = 'system_admin');

CREATE POLICY "Users can update their own or any profile if admin"
ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.get_user_role() = 'system_admin');

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own or any profile if admin"
ON public.profiles FOR DELETE USING (id = auth.uid() OR public.get_user_role() = 'system_admin');


-- Step 4: Add simplified RLS policies for inquiries table
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Drop any old/existing policies to be safe
DROP POLICY IF EXISTS "Users can view inquiries in their organization" ON public.inquiries;
DROP POLICY IF EXISTS "Users can create inquiries in their organization" ON public.inquiries;
DROP POLICY IF EXISTS "Users can update inquiries in their organization" ON public.inquiries;
DROP POLICY IF EXISTS "Users can delete inquiries in their organization" ON public.inquiries;

-- SELECT policy (with safe casting)
CREATE POLICY "Users can view inquiries in their organization"
ON public.inquiries FOR SELECT USING (
  public.get_user_role() = 'system_admin' OR
  (
    org_id = public.get_user_organization() AND
    (
      public.get_user_role() IN ('org_owner', 'tour_operator') OR
      (public.get_user_role() = 'agent' AND (
        (created_by IS NOT NULL AND created_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND created_by::uuid = auth.uid()) OR
        (assigned_to IS NOT NULL AND assigned_to ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND assigned_to::uuid = auth.uid())
      ))
    )
  )
);

-- INSERT policy
CREATE POLICY "Users can create inquiries in their organization"
ON public.inquiries FOR INSERT WITH CHECK (
  public.get_user_role() = 'system_admin' OR
  (
    org_id = public.get_user_organization() AND
    public.get_user_role() IN ('org_owner', 'tour_operator', 'agent')
  )
);

-- UPDATE policy (with safe casting)
CREATE POLICY "Users can update inquiries in their organization"
ON public.inquiries FOR UPDATE USING (
  public.get_user_role() = 'system_admin' OR
  (
    org_id = public.get_user_organization() AND
    (
      public.get_user_role() IN ('org_owner', 'tour_operator') OR
      (public.get_user_role() = 'agent' AND (
        (created_by IS NOT NULL AND created_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND created_by::uuid = auth.uid()) OR
        (assigned_to IS NOT NULL AND assigned_to ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND assigned_to::uuid = auth.uid())
      ))
    )
  )
);

-- DELETE policy
CREATE POLICY "Users can delete inquiries in their organization"
ON public.inquiries FOR DELETE USING (
  public.get_user_role() = 'system_admin' OR
  (
    org_id = public.get_user_organization() AND
    public.get_user_role() IN ('org_owner', 'tour_operator')
  )
);
