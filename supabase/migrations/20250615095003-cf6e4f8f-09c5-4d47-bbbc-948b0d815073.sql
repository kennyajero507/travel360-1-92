
-- 1. Normalized Quote Accommodation Table
CREATE TABLE public.quote_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  num_rooms INTEGER NOT NULL DEFAULT 1,
  rate_per_night NUMERIC NOT NULL DEFAULT 0,
  nights INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Normalized Quote Transport Table
CREATE TABLE public.quote_transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  transport_type TEXT NOT NULL,
  operator TEXT,
  mode TEXT,
  description TEXT,
  route TEXT,
  cost_per_person NUMERIC NOT NULL DEFAULT 0,
  num_passengers INTEGER NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Normalized Quote Transfers Table
CREATE TABLE public.quote_transfers_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  transfer_type TEXT NOT NULL,
  transfer_operator TEXT,
  ticket_type TEXT,
  travel_route TEXT,
  adult_cost NUMERIC DEFAULT 0,
  child_cost NUMERIC DEFAULT 0,
  no_adults INTEGER DEFAULT 1,
  no_children INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Normalized Quote Excursions Table
CREATE TABLE public.quote_excursions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  adult_cost NUMERIC DEFAULT 0,
  child_cost NUMERIC DEFAULT 0,
  number_of_people INTEGER DEFAULT 1,
  number_of_children INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Quote Markup Table
CREATE TABLE public.quote_markup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  markup_type TEXT NOT NULL DEFAULT 'percentage',
  value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Add a Postgres function for quote summaries (stub only; must be implemented according to requirements)
CREATE OR REPLACE FUNCTION public.calculate_quote_summary(quote_id_param uuid)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN '{}'::jsonb;
END;
$$;

-- 7. RLS Policies so all org members can access (can be tightened later)
ALTER TABLE public.quote_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_transfers_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_excursions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_markup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can manage quote accommodations"
  ON public.quote_accommodations FOR ALL USING (true);

CREATE POLICY "Org members can manage quote transport"
  ON public.quote_transport FOR ALL USING (true);

CREATE POLICY "Org members can manage quote transfers"
  ON public.quote_transfers_new FOR ALL USING (true);

CREATE POLICY "Org members can manage quote excursions"
  ON public.quote_excursions FOR ALL USING (true);

CREATE POLICY "Org members can manage quote markup"
  ON public.quote_markup FOR ALL USING (true);
