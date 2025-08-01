-- Fix function search_path security issues
CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Fix quote number generation function
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Fix trigger functions
CREATE OR REPLACE FUNCTION set_inquiry_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enquiry_number IS NULL THEN
        NEW.enquiry_number := public.generate_inquiry_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quote_number IS NULL THEN
        NEW.quote_number := public.generate_quote_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';