-- PHASE 1: Fix critical data integrity issues

-- Fix missing org_ids in inquiries table
UPDATE public.inquiries 
SET org_id = '29c42e81-e04c-4087-b259-2cfb8e5e9e96'
WHERE org_id IS NULL;

-- Fix missing org_ids in hotels table  
UPDATE public.hotels 
SET org_id = '29c42e81-e04c-4087-b259-2cfb8e5e9e96'
WHERE org_id IS NULL;

-- Add constraints to prevent future null org_ids
ALTER TABLE public.inquiries ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.hotels ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.quotes ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN org_id SET NOT NULL;

-- PHASE 2: Fix security issues with proper search paths

-- Fix generate_quote_number function
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    year_month TEXT;
    counter INTEGER;
    new_number TEXT;
BEGIN
    -- Get current year and month in YYMM format
    year_month := TO_CHAR(NOW(), 'YYMM');
    
    -- Get the next sequential number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 'QUO-' || year_month || '-(.*)') AS INTEGER)), 0) + 1
    INTO counter
    FROM public.quotes 
    WHERE quote_number LIKE 'QUO-' || year_month || '-%';
    
    -- Format the number with leading zeros
    new_number := 'QUO-' || year_month || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$;

-- Fix generate_inquiry_number function
CREATE OR REPLACE FUNCTION public.generate_inquiry_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    year_month TEXT;
    counter INTEGER;
    new_number TEXT;
BEGIN
    -- Get current year and month in YYMM format
    year_month := TO_CHAR(NOW(), 'YYMM');
    
    -- Get the next sequential number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(enquiry_number FROM 'ENQ-' || year_month || '-(.*)') AS INTEGER)), 0) + 1
    INTO counter
    FROM public.inquiries 
    WHERE enquiry_number LIKE 'ENQ-' || year_month || '-%';
    
    -- Format the number with leading zeros
    new_number := 'ENQ-' || year_month || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$;

-- Fix all other functions with search path issues
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.check_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin'
  );
$$;