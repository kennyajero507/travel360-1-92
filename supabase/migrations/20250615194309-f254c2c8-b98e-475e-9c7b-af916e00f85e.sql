
-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true);

-- Create RLS policies for the organization-logos bucket
CREATE POLICY "Allow authenticated users to upload logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to view logos" ON storage.objects
FOR SELECT USING (bucket_id = 'organization-logos');

CREATE POLICY "Allow users to update their organization logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'organization-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their organization logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'organization-logos' 
  AND auth.role() = 'authenticated'
);
