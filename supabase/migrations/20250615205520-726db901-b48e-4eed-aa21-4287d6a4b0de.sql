
-- 1. Table for system admin audit logs on organization actions
CREATE TABLE IF NOT EXISTS public.organization_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NULL REFERENCES public.organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  admin_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS on organization_audit_logs: only system admins (using check_system_admin) can manage
ALTER TABLE public.organization_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only allow system admins (org_audit_logs)" ON public.organization_audit_logs;
CREATE POLICY "Only allow system admins (org_audit_logs)"
  ON public.organization_audit_logs
  FOR ALL
  USING (check_system_admin());

-- 3. Add soft-delete columns to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

-- 4. (Optional) Policy: only system admins or org_owner can soft-delete their org
DROP POLICY IF EXISTS "Manage org as system admin or org owner" ON public.organizations;
CREATE POLICY "Manage org as system admin or org owner"
  ON public.organizations
  FOR UPDATE
  USING (
    check_system_admin() OR
    owner_id = auth.uid()
  );
