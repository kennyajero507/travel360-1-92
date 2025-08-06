-- Fix quote number trigger to ensure all quotes get proper quote numbers
CREATE OR REPLACE FUNCTION public.set_quote_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Always set quote number if it's null
    IF NEW.quote_number IS NULL THEN
        NEW.quote_number := public.generate_quote_number();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update the trigger to always fire on insert
DROP TRIGGER IF EXISTS set_quote_number_trigger ON public.quotes;
CREATE TRIGGER set_quote_number_trigger
    BEFORE INSERT ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_quote_number();

-- Fix organization settings default currency fallback
UPDATE public.organization_settings 
SET default_currency = 'KES' 
WHERE default_currency IS NULL AND org_id IS NOT NULL;