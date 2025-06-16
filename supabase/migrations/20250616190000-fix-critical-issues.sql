
-- Create execute_sql function for SQL executor (system admin only)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS TABLE(result JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_result RECORD;
  results JSONB[] := '{}';
  final_result JSONB;
BEGIN
  -- Only allow system admins to execute raw SQL
  IF NOT public.check_system_admin() THEN
    RAISE EXCEPTION 'Access denied. System admin privileges required.';
  END IF;
  
  -- Execute the query and return results as JSONB
  FOR query_result IN EXECUTE sql_query LOOP
    results := results || to_jsonb(query_result);
  END LOOP;
  
  final_result := array_to_json(results)::JSONB;
  RETURN QUERY SELECT final_result;
END;
$$;

-- Add RLS policies for inquiry agent assignment
CREATE POLICY "Agents can view assigned inquiries" ON public.inquiries
  FOR SELECT USING (
    auth.uid() = assigned_to OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('system_admin', 'org_owner')
  );

-- Update default currency to KES (Kenya Shilling)
ALTER TABLE public.profiles ALTER COLUMN currency SET DEFAULT 'KES';
ALTER TABLE public.quotes ALTER COLUMN preferred_currency SET DEFAULT 'KES';
ALTER TABLE public.quotes ALTER COLUMN currency_code SET DEFAULT 'KES';
ALTER TABLE public.invoices ALTER COLUMN currency_code SET DEFAULT 'KES';
ALTER TABLE public.payments ALTER COLUMN currency_code SET DEFAULT 'KES';
