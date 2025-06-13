
-- Add missing preferred_currency column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'USD';

-- Ensure booking reference trigger exists and works properly
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  sequence_number INT;
  new_reference TEXT;
BEGIN
  -- Only generate if booking_reference is null or empty
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    -- Get current year
    year_part := to_char(CURRENT_DATE, 'YYYY');
    
    -- Get count of bookings for this year and increment by 1
    SELECT COUNT(*) + 1 INTO sequence_number
    FROM public.bookings
    WHERE booking_reference LIKE 'BK-' || year_part || '-%';
    
    -- Format as BK-YYYY-NNNN (zero-padded to 4 digits)
    new_reference := 'BK-' || year_part || '-' || LPAD(sequence_number::TEXT, 4, '0');
    
    -- Set the new booking reference
    NEW.booking_reference := new_reference;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS set_booking_reference ON public.bookings;
CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_booking_reference();
