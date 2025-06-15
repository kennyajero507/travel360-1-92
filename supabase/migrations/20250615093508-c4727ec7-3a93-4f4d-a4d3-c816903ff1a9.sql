
-- Create hotels table
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  location TEXT,
  address TEXT,
  description TEXT,
  amenities JSONB,
  room_types JSONB,
  images JSONB,
  contact_info JSONB,
  pricing JSONB,
  policies JSONB,
  additional_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  org_id UUID
);

-- Create inquiries table
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY,
  org_id UUID,
  enquiry_number TEXT GENERATED ALWAYS AS ('ENQ-' || substring(id::text,1,8)) STORED,
  tour_type TEXT NOT NULL, -- 'domestic' or 'international'
  lead_source TEXT,
  tour_consultant TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_mobile TEXT NOT NULL,
  destination TEXT NOT NULL,
  package_name TEXT,
  custom_package TEXT,
  custom_destination TEXT,
  description TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  days_count INT,
  nights_count INT,
  adults INT NOT NULL,
  children INT NOT NULL,
  infants INT NOT NULL,
  num_rooms INT,
  priority TEXT,
  assigned_to UUID,
  assigned_agent_name TEXT,
  created_by UUID,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id TEXT,
  client TEXT,
  destination TEXT NOT NULL,
  package_name TEXT,
  tour_type TEXT,
  lead_source TEXT,
  start_date DATE,
  end_date DATE,
  duration_days INT,
  duration_nights INT,
  adults INT,
  children_with_bed INT,
  children_no_bed INT,
  infants INT,
  status TEXT NOT NULL DEFAULT 'draft',
  hotel_id UUID,
  approved_hotel_id UUID,
  room_arrangements JSONB,
  activities JSONB,
  transports JSONB,
  transfers JSONB,
  markup_type TEXT,
  markup_value NUMERIC,
  currency_code TEXT,
  sectionMarkups JSONB,
  summary_data JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Allow org members to select/manage their own hotels, inquiries, and quotes
CREATE POLICY "Org members manage own hotels"
  ON public.hotels
  FOR ALL
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org members manage own inquiries"
  ON public.inquiries
  FOR ALL
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org members manage own quotes"
  ON public.quotes
  FOR ALL
  USING (
    TRUE  -- For now, allow all org members to access all quotes; refine if needed
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotels_org_id ON public.hotels(org_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_org_id ON public.inquiries(org_id);
CREATE INDEX IF NOT EXISTS idx_quotes_inquiry_id ON public.quotes(inquiry_id);

