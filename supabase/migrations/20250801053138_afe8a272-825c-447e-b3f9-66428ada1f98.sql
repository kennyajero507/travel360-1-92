-- Update inquiries table to match the new requirements
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS enquiry_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tour_type TEXT DEFAULT 'international',
ADD COLUMN IF NOT EXISTS package_name TEXT,
ADD COLUMN IF NOT EXISTS client_mobile TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS destination TEXT,
ADD COLUMN IF NOT EXISTS travel_start DATE,
ADD COLUMN IF NOT EXISTS travel_end DATE,
ADD COLUMN IF NOT EXISTS days_count INTEGER,
ADD COLUMN IF NOT EXISTS nights_count INTEGER,
ADD COLUMN IF NOT EXISTS num_adults INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS num_children INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS children_with_bed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS children_no_bed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS num_rooms INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update quotes table to match requirements
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS quote_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS sleeping_arrangements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS transport_options JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS transfer_options JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS markup_percentage NUMERIC DEFAULT 15,
ADD COLUMN IF NOT EXISTS markup_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS valid_until DATE;

-- Create a function to generate inquiry numbers
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
    FROM inquiries 
    WHERE enquiry_number LIKE 'ENQ-' || year_month || '-%';
    
    -- Format the number with leading zeros
    new_number := 'ENQ-' || year_month || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to generate quote numbers
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
    FROM quotes 
    WHERE quote_number LIKE 'QUO-' || year_month || '-%';
    
    -- Format the number with leading zeros
    new_number := 'QUO-' || year_month || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to auto-generate numbers
CREATE OR REPLACE FUNCTION set_inquiry_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enquiry_number IS NULL THEN
        NEW.enquiry_number := generate_inquiry_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quote_number IS NULL THEN
        NEW.quote_number := generate_quote_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_inquiry_number ON inquiries;
CREATE TRIGGER trigger_set_inquiry_number
    BEFORE INSERT ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION set_inquiry_number();

DROP TRIGGER IF EXISTS trigger_set_quote_number ON quotes;
CREATE TRIGGER trigger_set_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION set_quote_number();