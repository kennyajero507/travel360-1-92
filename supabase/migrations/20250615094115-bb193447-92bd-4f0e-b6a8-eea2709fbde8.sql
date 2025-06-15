
-- 1. Create the bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL,
  client TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  hotel_id UUID,
  agent_id UUID,
  travel_start DATE NOT NULL,
  travel_end DATE NOT NULL,
  room_arrangement JSONB,
  transport JSONB,
  activities JSONB,
  transfers JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  total_price NUMERIC NOT NULL DEFAULT 0,
  quote_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_quote_id FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);

-- 2. Create the invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  booking_id UUID,
  quote_id UUID,
  organization_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft',
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  notes TEXT,
  line_items JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  CONSTRAINT fk_invoice_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoice_quote_id FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);

-- 3. Create the payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  invoice_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_payment_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_payment_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- 4. Create the travel_vouchers table
CREATE TABLE public.travel_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  voucher_reference TEXT NOT NULL,
  issued_date DATE NOT NULL DEFAULT now(),
  issued_by UUID,
  notes TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  voucher_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_voucher_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 5. RLS (Row Level Security) - defer to organization/user context for custom security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_vouchers ENABLE ROW LEVEL SECURITY;

-- Grant all organization members access -- you may want to further restrict these in your deployment
CREATE POLICY "Org members can manage their bookings"
  ON public.bookings
  FOR ALL
  USING (true);

CREATE POLICY "Org members can manage their invoices"
  ON public.invoices
  FOR ALL
  USING (true);

CREATE POLICY "Org members can manage their payments"
  ON public.payments
  FOR ALL
  USING (true);

CREATE POLICY "Org members can manage their vouchers"
  ON public.travel_vouchers
  FOR ALL
  USING (true);
