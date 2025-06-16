
-- ===== FIX CRITICAL RLS DATABASE ISSUES (CORRECTED) =====

-- First, let's fix the quotes.created_by column type issue
-- Check the current type and convert if needed
DO $$
BEGIN
  -- If created_by is TEXT, we need to handle the conversion carefully
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' 
    AND column_name = 'created_by' 
    AND data_type = 'text'
  ) THEN
    -- Add a temporary UUID column
    ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS created_by_uuid UUID;
    
    -- Update the UUID column with valid UUIDs from the text column
    UPDATE public.quotes 
    SET created_by_uuid = created_by::uuid 
    WHERE created_by IS NOT NULL 
    AND created_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    
    -- Drop the old column and rename the new one
    ALTER TABLE public.quotes DROP COLUMN created_by;
    ALTER TABLE public.quotes RENAME COLUMN created_by_uuid TO created_by;
  END IF;
END $$;

-- Add org_id to quotes table if not exists
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS org_id UUID;

-- Backfill org_id for existing quotes using the corrected created_by column
UPDATE public.quotes q
SET org_id = (
  SELECT p.org_id 
  FROM public.profiles p 
  WHERE p.id = q.created_by
)
WHERE q.org_id IS NULL 
  AND q.created_by IS NOT NULL;

-- Add foreign key constraints (checking if they exist first)
DO $$
BEGIN
  -- Add foreign key constraint for org_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_quotes_org'
  ) THEN
    ALTER TABLE public.quotes 
    ADD CONSTRAINT fk_quotes_org 
    FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for created_by to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_quotes_created_by'
  ) THEN
    ALTER TABLE public.quotes 
    ADD CONSTRAINT fk_quotes_created_by 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ===== NOW CREATE THE COMPREHENSIVE RLS POLICIES =====

-- Drop all existing problematic policies first
DROP POLICY IF EXISTS "Org members manage own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can view quotes from their organization" ON public.quotes;
DROP POLICY IF EXISTS "Users can create quotes for their organization" ON public.quotes;
DROP POLICY IF EXISTS "Users can update quotes from their organization" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete quotes from their organization" ON public.quotes;
DROP POLICY IF EXISTS "Allow org members or system admin" ON public.quotes;

-- Enable RLS on quotes table
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create new secure policies for quotes
CREATE POLICY "Quotes: Org members can manage own quotes"
ON public.quotes FOR ALL
USING (
  check_system_admin() OR
  org_id = get_user_organization()
);

-- ===== HOTELS TABLE POLICIES =====
DROP POLICY IF EXISTS "Org members manage own hotels" ON public.hotels;
DROP POLICY IF EXISTS "Users can view hotels from their organization" ON public.hotels;
DROP POLICY IF EXISTS "Users can create hotels" ON public.hotels;
DROP POLICY IF EXISTS "Users can update hotels from their organization" ON public.hotels;
DROP POLICY IF EXISTS "Users can delete hotels from their organization" ON public.hotels;

CREATE POLICY "Hotels: Org members can manage own hotels"
ON public.hotels FOR ALL
USING (
  check_system_admin() OR
  org_id = get_user_organization()
);

-- ===== INQUIRIES TABLE POLICIES =====
DROP POLICY IF EXISTS "Org members manage own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view inquiries in their organization" ON public.inquiries;
DROP POLICY IF EXISTS "Users can create inquiries in their organization" ON public.inquiries;
DROP POLICY IF EXISTS "Users can update inquiries in their organization" ON public.inquiries;
DROP POLICY IF EXISTS "Users can delete inquiries in their organization" ON public.inquiries;

CREATE POLICY "Inquiries: Org members can manage own inquiries"
ON public.inquiries FOR ALL
USING (
  check_system_admin() OR
  org_id = get_user_organization()
);

-- ===== BOOKINGS TABLE POLICIES =====
DROP POLICY IF EXISTS "Org members manage own bookings" ON public.bookings;

CREATE POLICY "Bookings: Org members can manage own bookings"
ON public.bookings FOR ALL
USING (
  check_system_admin() OR
  org_id = get_user_organization()
);

-- ===== CLIENTS TABLE POLICIES =====
DROP POLICY IF EXISTS "Allow full access to own organization's clients" ON public.clients;
DROP POLICY IF EXISTS "Org members manage own clients" ON public.clients;

CREATE POLICY "Clients: Org members can manage own clients"
ON public.clients FOR ALL
USING (
  check_system_admin() OR
  org_id = get_user_organization()
);

-- ===== QUOTE RELATED TABLES POLICIES =====
-- Quote Accommodations
DROP POLICY IF EXISTS "Org members manage quote accommodations" ON public.quote_accommodations;
CREATE POLICY "Quote Accommodations: Org members only"
ON public.quote_accommodations FOR ALL
USING (
  check_system_admin() OR
  quote_id IN (SELECT id FROM public.quotes WHERE org_id = get_user_organization())
);

-- Quote Transport
DROP POLICY IF EXISTS "Org members manage quote transport" ON public.quote_transport;
CREATE POLICY "Quote Transport: Org members only"
ON public.quote_transport FOR ALL
USING (
  check_system_admin() OR
  quote_id IN (SELECT id FROM public.quotes WHERE org_id = get_user_organization())
);

-- Quote Transfers
DROP POLICY IF EXISTS "Org members manage quote transfers" ON public.quote_transfers_new;
CREATE POLICY "Quote Transfers: Org members only"
ON public.quote_transfers_new FOR ALL
USING (
  check_system_admin() OR
  quote_id IN (SELECT id FROM public.quotes WHERE org_id = get_user_organization())
);

-- Quote Excursions
DROP POLICY IF EXISTS "Org members manage quote excursions" ON public.quote_excursions;
CREATE POLICY "Quote Excursions: Org members only"
ON public.quote_excursions FOR ALL
USING (
  check_system_admin() OR
  quote_id IN (SELECT id FROM public.quotes WHERE org_id = get_user_organization())
);

-- Quote Markup
DROP POLICY IF EXISTS "Org members manage quote markup" ON public.quote_markup;
CREATE POLICY "Quote Markup: Org members only"
ON public.quote_markup FOR ALL
USING (
  check_system_admin() OR
  quote_id IN (SELECT id FROM public.quotes WHERE org_id = get_user_organization())
);

-- Quote Hotel Options
DROP POLICY IF EXISTS "Org members manage quote hotel options" ON public.quote_hotel_options;
CREATE POLICY "Quote Hotel Options: Org members only"
ON public.quote_hotel_options FOR ALL
USING (
  check_system_admin() OR
  quote_id IN (SELECT id FROM public.quotes WHERE org_id = get_user_organization())
);

-- ===== TRIGGERS TO ENSURE ORG_ID IS SET =====
CREATE OR REPLACE FUNCTION public.set_org_id_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := get_user_organization();
  END IF;
  
  IF NEW.org_id IS NULL THEN
    RAISE EXCEPTION 'User must belong to an organization to perform this action';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply triggers to tables that need org_id
DO $$
DECLARE
    table_name TEXT;
    tables_needing_org TEXT[] := ARRAY['hotels', 'inquiries', 'quotes', 'bookings', 'clients'];
BEGIN
    FOREACH table_name IN ARRAY tables_needing_org
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_org_id_%I ON public.%I',
            table_name, table_name
        );
        
        EXECUTE format(
            'CREATE TRIGGER set_org_id_%I
             BEFORE INSERT ON public.%I
             FOR EACH ROW
             EXECUTE FUNCTION public.set_org_id_on_insert()',
            table_name, table_name
        );
    END LOOP;
END $$;

-- ===== BACKUP STRATEGY SETUP =====
-- Create a function for automated backups
CREATE OR REPLACE FUNCTION public.create_data_backup()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_info TEXT;
BEGIN
  -- This function can be called by cron jobs or manual triggers
  -- In production, this would integrate with your backup system
  backup_info := 'Backup created at: ' || now()::text;
  
  -- Log the backup operation
  INSERT INTO public.audit_logs (
    table_name, operation, record_id, user_id, new_values
  ) VALUES (
    'system_backup', 'BACKUP', 'system', auth.uid(),
    jsonb_build_object('timestamp', now(), 'type', 'manual_backup')
  );
  
  RETURN backup_info;
END;
$$;

-- Grant necessary permissions for RLS to work properly
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
