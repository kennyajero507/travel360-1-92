
-- Add subscription management and organization status fields
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'suspended')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create role permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  resource TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, permission, resource, action)
);

-- Create system events table for monitoring
CREATE TABLE IF NOT EXISTS public.system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT,
  message TEXT,
  metadata JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create system metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- Create admin activity logs
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for system admin access
CREATE POLICY "system_admin_access_role_permissions" ON public.role_permissions
  FOR ALL USING (public.check_system_admin());

CREATE POLICY "system_admin_access_system_events" ON public.system_events
  FOR ALL USING (public.check_system_admin());

CREATE POLICY "system_admin_access_system_metrics" ON public.system_metrics
  FOR ALL USING (public.check_system_admin());

CREATE POLICY "system_admin_access_admin_logs" ON public.admin_activity_logs
  FOR ALL USING (public.check_system_admin());

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission, resource, action) VALUES
  ('system_admin', 'full_access', '*', '*'),
  ('org_owner', 'manage', 'organization', 'all'),
  ('org_owner', 'manage', 'users', 'organization'),
  ('org_owner', 'create', 'quotes', 'all'),
  ('org_owner', 'create', 'bookings', 'all'),
  ('tour_operator', 'create', 'quotes', 'all'),
  ('tour_operator', 'create', 'bookings', 'all'),
  ('tour_operator', 'manage', 'users', 'team'),
  ('agent', 'create', 'inquiries', 'all'),
  ('agent', 'view', 'quotes', 'assigned'),
  ('agent', 'update', 'bookings', 'assigned'),
  ('client', 'view', 'own_data', 'all')
ON CONFLICT (role, permission, resource, action) DO NOTHING;

-- Create function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_details,
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_resource TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Get user role
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- System admin has all permissions
  IF user_role = 'system_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permission
  SELECT EXISTS(
    SELECT 1 FROM public.role_permissions 
    WHERE role = user_role 
    AND permission = p_permission
    AND (resource IS NULL OR resource = p_resource OR resource = '*')
    AND (action = p_action OR action = 'all' OR action = '*')
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;
