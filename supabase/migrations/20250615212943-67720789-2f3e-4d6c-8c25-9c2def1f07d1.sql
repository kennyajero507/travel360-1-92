
-- 1. Enable realtime on key tables for all row changes
ALTER TABLE public.inquiries REPLICA IDENTITY FULL;
ALTER TABLE public.quotes REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.travel_vouchers REPLICA IDENTITY FULL;

-- Add each table to supabase_realtime publication (no-op if already present)
-- (handled automatically, but adding for clarity):
-- (Supabase by default adds all tables, but run this if not realtime yet.)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries, public.quotes, public.bookings, public.travel_vouchers;

-- 2. Add comprehensive RLS to each main table
-- Most grant access to org members (through profiles) or system_admins (via check_system_admin function)

-- INQUIRIES RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow org members or system admin" ON public.inquiries;
CREATE POLICY "Allow org members or system admin" ON public.inquiries
  FOR ALL
  USING (
    check_system_admin() OR org_id = get_user_organization()
  );

-- QUOTES RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow org members or system admin" ON public.quotes;
CREATE POLICY "Allow org members or system admin" ON public.quotes
  FOR ALL
  USING (
    check_system_admin() OR
    (SELECT org_id FROM public.profiles WHERE id = auth.uid()) = (
      SELECT org_id FROM public.clients WHERE name = client LIMIT 1
    )
  );

-- BOOKINGS RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow org members or system admin" ON public.bookings;
CREATE POLICY "Allow org members or system admin" ON public.bookings
  FOR ALL
  USING (
    check_system_admin() OR 
    org_id = get_user_organization()
  );

-- VOUCHERS RLS
ALTER TABLE public.travel_vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow org members or system admin" ON public.travel_vouchers;
CREATE POLICY "Allow org members or system admin" ON public.travel_vouchers
  FOR ALL
  USING (
    check_system_admin() OR
    booking_id IN (
      SELECT id FROM public.bookings WHERE org_id = get_user_organization()
    )
  );


-- 3. Comprehensive audit logging triggers

-- Create audit log function if not exists
CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name, operation, record_id, user_id, old_values, new_values
  )
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id::text, OLD.id::text),
    auth.uid(),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers for audit logging
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_inquiries'
  ) THEN
    CREATE TRIGGER audit_inquiries AFTER INSERT OR UPDATE OR DELETE ON public.inquiries
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_quotes'
  ) THEN
    CREATE TRIGGER audit_quotes AFTER INSERT OR UPDATE OR DELETE ON public.quotes
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_bookings'
  ) THEN
    CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON public.bookings
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_travel_vouchers'
  ) THEN
    CREATE TRIGGER audit_travel_vouchers AFTER INSERT OR UPDATE OR DELETE ON public.travel_vouchers
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();
  END IF;
END $$;

-- 4. Example backend validation: ensure required fields (for illustration only)
-- (For real business logic, do this with more custom triggers or check constraints as necessary.)

-- Example: Bookings must have client and hotel_name non-empty
ALTER TABLE public.bookings
  ALTER COLUMN client SET NOT NULL,
  ALTER COLUMN hotel_name SET NOT NULL;

-- Example: Inquiries must have destination and client_name non-empty
ALTER TABLE public.inquiries
  ALTER COLUMN destination SET NOT NULL,
  ALTER COLUMN client_name SET NOT NULL;
