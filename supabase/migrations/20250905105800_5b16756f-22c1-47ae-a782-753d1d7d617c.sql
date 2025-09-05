-- Fix remaining functions with search path issues

CREATE OR REPLACE FUNCTION public.check_if_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.system_admins 
    WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_system_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(SELECT 1 FROM public.system_admins WHERE user_id = $1);
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'agent'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_org_id_from_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := (SELECT org_id FROM public.profiles WHERE id = auth.uid());
  END IF;
  
  IF NEW.org_id IS NULL THEN
    RAISE EXCEPTION 'User must belong to an organization to perform this action';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.set_org_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := (SELECT org_id FROM public.profiles WHERE id = auth.uid());
  END IF;
  
  IF NEW.org_id IS NULL THEN
    RAISE EXCEPTION 'User must belong to an organization to perform this action';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN (SELECT org_id FROM public.profiles WHERE id = auth.uid());
END;
$$;