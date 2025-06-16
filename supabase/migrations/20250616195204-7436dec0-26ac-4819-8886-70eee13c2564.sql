
-- Create tour_templates table
CREATE TABLE public.tour_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Kenya',
  region TEXT,
  duration_days INTEGER NOT NULL,
  duration_nights INTEGER NOT NULL,
  tour_type TEXT CHECK (tour_type IN ('domestic', 'international')),
  description TEXT,
  inclusions JSONB DEFAULT '[]',
  exclusions JSONB DEFAULT '[]',
  base_price NUMERIC,
  currency_code TEXT DEFAULT 'KES',
  itinerary JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  org_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view tour templates in their org"
  ON public.tour_templates FOR SELECT
  USING (org_id = get_user_organization() OR check_system_admin());

CREATE POLICY "Users can create tour templates in their org"
  ON public.tour_templates FOR INSERT
  WITH CHECK (org_id = get_user_organization());

CREATE POLICY "Users can update tour templates in their org"
  ON public.tour_templates FOR UPDATE
  USING (org_id = get_user_organization());

CREATE POLICY "Users can delete tour templates in their org"
  ON public.tour_templates FOR DELETE
  USING (org_id = get_user_organization());

-- Add org_id trigger
CREATE TRIGGER set_org_id_tour_templates
  BEFORE INSERT ON public.tour_templates
  FOR EACH ROW EXECUTE FUNCTION set_org_id_on_insert();

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tour_templates_updated_at
  BEFORE UPDATE ON public.tour_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
