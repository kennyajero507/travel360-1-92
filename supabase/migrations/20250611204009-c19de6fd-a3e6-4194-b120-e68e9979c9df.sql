
-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for organization logos bucket
CREATE POLICY "Users can view all logos" ON storage.objects
FOR SELECT USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their organization's logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'organization-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT org_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their organization's logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'organization-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (
    SELECT org_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Add RLS policies for hotels table to ensure proper access control
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotels in their organization" ON public.hotels
FOR SELECT USING (
  check_system_admin() OR
  org_id = get_user_organization()
);

CREATE POLICY "Users can create hotels in their organization" ON public.hotels
FOR INSERT WITH CHECK (
  check_system_admin() OR
  (org_id = get_user_organization() AND check_user_role('org_owner'))
);

CREATE POLICY "Users can update hotels in their organization" ON public.hotels
FOR UPDATE USING (
  check_system_admin() OR
  (org_id = get_user_organization() AND check_user_role('org_owner'))
);

CREATE POLICY "Users can delete hotels in their organization" ON public.hotels
FOR DELETE USING (
  check_system_admin() OR
  (org_id = get_user_organization() AND check_user_role('org_owner'))
);
