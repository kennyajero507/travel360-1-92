-- Enable pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify the quote-related functions are working properly
-- Update the client portal token generation function to be more robust
CREATE OR REPLACE FUNCTION public.generate_client_portal_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'qpt_' || encode(gen_random_bytes(32), 'base64url');
END;
$function$;

-- Ensure quotes table has proper triggers
DROP TRIGGER IF EXISTS set_quote_number_trigger ON public.quotes;
CREATE TRIGGER set_quote_number_trigger
  BEFORE INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_quote_number();

DROP TRIGGER IF EXISTS set_quote_portal_token_trigger ON public.quotes;
CREATE TRIGGER set_quote_portal_token_trigger
  BEFORE INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_client_portal_token();