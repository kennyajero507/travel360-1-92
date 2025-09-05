-- Fix the quote number trigger to ensure it runs correctly
DROP TRIGGER IF EXISTS set_quote_number_trigger ON public.quotes;

CREATE TRIGGER set_quote_number_trigger
    BEFORE INSERT ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_quote_number();

-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Always set quote number if it's null
    IF NEW.quote_number IS NULL THEN
        NEW.quote_number := public.generate_quote_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update existing quotes to have quote numbers
UPDATE public.quotes 
SET quote_number = public.generate_quote_number()
WHERE quote_number IS NULL;

-- Fix the inquiry number trigger as well
CREATE OR REPLACE FUNCTION public.set_inquiry_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enquiry_number IS NULL THEN
        NEW.enquiry_number := public.generate_inquiry_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;