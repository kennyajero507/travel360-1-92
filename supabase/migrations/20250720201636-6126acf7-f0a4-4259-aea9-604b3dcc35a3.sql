-- Fix database functions without proper search_path
-- This addresses the security warnings from the linter

-- Update the existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'agent'
  );
$$;

CREATE OR REPLACE FUNCTION public.check_if_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.system_admins 
    WHERE user_id = auth.uid()
  );
$$;