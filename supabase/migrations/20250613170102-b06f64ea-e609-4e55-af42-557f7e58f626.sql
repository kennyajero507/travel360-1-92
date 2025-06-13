
-- Step 2: Add short ID fields to organizations and quotes tables
ALTER TABLE public.organizations 
ADD COLUMN short_code TEXT UNIQUE;

ALTER TABLE public.quotes 
ADD COLUMN short_id TEXT UNIQUE;

-- Create function to generate organization short codes
CREATE OR REPLACE FUNCTION generate_org_short_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    new_code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.organizations WHERE short_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate quote short IDs
CREATE OR REPLACE FUNCTION generate_quote_short_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric ID
    new_id := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.quotes WHERE short_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-generate short codes/IDs
CREATE OR REPLACE FUNCTION set_org_short_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.short_code IS NULL THEN
    NEW.short_code := generate_org_short_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_quote_short_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.short_id IS NULL THEN
    NEW.short_id := generate_quote_short_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER trigger_org_short_code
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_org_short_code();

CREATE TRIGGER trigger_quote_short_id
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_short_id();

-- Add audit log table for Step 5
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for audit logs (system admins can view all, users can view their own)
CREATE POLICY "Users can view their own audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'system_admin'
  ));

-- Add exchange rates table for currency system
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  target_currency TEXT NOT NULL,
  rate NUMERIC(10,6) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(base_currency, target_currency)
);

-- Insert initial exchange rates (will be updated by API)
INSERT INTO public.exchange_rates (base_currency, target_currency, rate) VALUES
('USD', 'EUR', 0.85),
('USD', 'GBP', 0.73),
('USD', 'JPY', 110.0),
('USD', 'CAD', 1.25),
('USD', 'AUD', 1.35),
('USD', 'INR', 75.0),
('USD', 'CNY', 6.5);
