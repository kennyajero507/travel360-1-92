
-- Phase 1: Database Schema Fixes
-- Add country field to profiles table with default value
ALTER TABLE public.profiles 
ADD COLUMN country text DEFAULT 'Kenya';

-- Update existing profiles to have Kenya as default country
UPDATE public.profiles 
SET country = 'Kenya' 
WHERE country IS NULL;

-- Add organization settings table for country-specific defaults
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  default_country text DEFAULT 'Kenya',
  default_currency text DEFAULT 'KES',
  default_regions jsonb DEFAULT '["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(org_id)
);

-- Enable RLS on organization_settings
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organization_settings
CREATE POLICY "Users can view their org settings" ON public.organization_settings
  FOR SELECT USING (org_id = get_user_organization());

CREATE POLICY "Org owners can manage org settings" ON public.organization_settings
  FOR ALL USING (
    org_id = get_user_organization() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('org_owner', 'system_admin')
    )
  );

-- Insert default settings for existing organizations
INSERT INTO public.organization_settings (org_id, default_country, default_currency)
SELECT id, 'Kenya', 'KES' 
FROM public.organizations 
WHERE id NOT IN (SELECT org_id FROM public.organization_settings WHERE org_id IS NOT NULL)
ON CONFLICT (org_id) DO NOTHING;

-- Update trigger for organization_settings
CREATE OR REPLACE FUNCTION update_organization_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION update_organization_settings_updated_at();

-- Create function to get organization settings
CREATE OR REPLACE FUNCTION public.get_organization_settings(p_org_id uuid DEFAULT NULL)
RETURNS TABLE(
  org_id uuid,
  default_country text,
  default_currency text,
  default_regions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_org_id uuid;
BEGIN
  -- Use provided org_id or get from current user
  target_org_id := COALESCE(p_org_id, get_user_organization());
  
  RETURN QUERY
  SELECT 
    os.org_id,
    os.default_country,
    os.default_currency,
    os.default_regions
  FROM public.organization_settings os
  WHERE os.org_id = target_org_id;
END;
$$;

-- Fix any profiles without org_id (for system_admin users)
UPDATE public.profiles 
SET org_id = (SELECT id FROM public.organizations LIMIT 1)
WHERE org_id IS NULL AND role = 'system_admin';
