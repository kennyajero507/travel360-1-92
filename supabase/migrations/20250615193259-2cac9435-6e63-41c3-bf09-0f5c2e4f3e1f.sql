
-- Add branding columns to the organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0d9488',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#64748b';
