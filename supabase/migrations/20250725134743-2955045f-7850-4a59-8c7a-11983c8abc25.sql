-- Create organization creation function for SimpleAuth
CREATE OR REPLACE FUNCTION public.create_user_organization(org_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid;
  new_org_id uuid;
  user_profile profiles%ROWTYPE;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Check if user exists and get profile
  SELECT * INTO user_profile FROM public.profiles WHERE id = current_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  -- Check if user is org_owner
  IF user_profile.role != 'org_owner' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only organization owners can create organizations');
  END IF;
  
  -- Check if user already has an organization
  IF user_profile.org_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already belongs to an organization');
  END IF;
  
  -- Create new organization
  INSERT INTO public.organizations (name, owner_id, status, subscription_status)
  VALUES (org_name, current_user_id, 'active', 'trial')
  RETURNING id INTO new_org_id;
  
  -- Update user's profile with new org_id
  UPDATE public.profiles 
  SET org_id = new_org_id, updated_at = now()
  WHERE id = current_user_id;
  
  -- Create default organization settings
  INSERT INTO public.organization_settings (org_id)
  VALUES (new_org_id);
  
  -- Log the organization creation
  INSERT INTO public.audit_logs (
    table_name, operation, record_id, user_id, new_values
  ) VALUES (
    'organizations', 'CREATE', new_org_id::text, current_user_id,
    jsonb_build_object('name', org_name, 'owner_id', current_user_id)
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'org_id', new_org_id,
    'message', 'Organization created successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;