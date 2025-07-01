
-- Add missing columns to profiles table to match UserProfile interface
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update the trigger to set updated_at on profile updates
CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_updated_at();

-- Update existing profiles to have updated_at value
UPDATE public.profiles 
SET updated_at = created_at 
WHERE updated_at IS NULL;
