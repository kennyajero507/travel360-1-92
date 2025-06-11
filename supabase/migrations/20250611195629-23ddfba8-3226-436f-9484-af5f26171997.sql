
-- Create normalized quote tables as per the specification

-- 1. Quote Accommodations table
CREATE TABLE public.quote_accommodations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT NOT NULL,
  room_arrangement TEXT NOT NULL,
  room_type TEXT NOT NULL,
  no_rooms INTEGER NOT NULL DEFAULT 1,
  no_adults INTEGER NOT NULL DEFAULT 1,
  no_cwb INTEGER NOT NULL DEFAULT 0,
  no_cnb INTEGER NOT NULL DEFAULT 0,
  no_infants INTEGER NOT NULL DEFAULT 0,
  adult_cost NUMERIC NOT NULL DEFAULT 0,
  cwb_cost NUMERIC NOT NULL DEFAULT 0,
  cnb_cost NUMERIC NOT NULL DEFAULT 0,
  infant_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Quote Transport table
CREATE TABLE public.quote_transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT NOT NULL,
  transport_mode TEXT NOT NULL,
  transport_operator TEXT,
  ticket_class TEXT,
  ticket_type TEXT,
  travel_route TEXT NOT NULL,
  adult_cost NUMERIC NOT NULL DEFAULT 0,
  child_cost NUMERIC NOT NULL DEFAULT 0,
  no_adults INTEGER NOT NULL DEFAULT 1,
  no_children INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Quote Transfers table
CREATE TABLE public.quote_transfers_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT NOT NULL,
  transfer_operator TEXT,
  transfer_type TEXT NOT NULL,
  ticket_type TEXT,
  travel_route TEXT NOT NULL,
  adult_cost NUMERIC NOT NULL DEFAULT 0,
  child_cost NUMERIC NOT NULL DEFAULT 0,
  no_adults INTEGER NOT NULL DEFAULT 1,
  no_children INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Quote Excursions table
CREATE TABLE public.quote_excursions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  adult_cost NUMERIC NOT NULL DEFAULT 0,
  child_cost NUMERIC NOT NULL DEFAULT 0,
  number_of_people INTEGER NOT NULL DEFAULT 1,
  number_of_children INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Quote Markup table
CREATE TABLE public.quote_markup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT NOT NULL UNIQUE,
  markup_percentage NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add summary_data column to quotes table for caching calculations
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS summary_data JSONB DEFAULT '{}';

-- Enable RLS on all new tables
ALTER TABLE public.quote_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_transfers_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_excursions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_markup ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quote_accommodations
CREATE POLICY "Users can view accommodations from their organization" 
ON public.quote_accommodations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_accommodations.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
      )
    )
  )
);

CREATE POLICY "Users can modify accommodations from their organization" 
ON public.quote_accommodations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_accommodations.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
        AND user_profile.role IN ('org_owner', 'tour_operator', 'agent')
      )
    )
  )
);

-- Create RLS policies for quote_transport
CREATE POLICY "Users can view transport from their organization" 
ON public.quote_transport FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_transport.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
      )
    )
  )
);

CREATE POLICY "Users can modify transport from their organization" 
ON public.quote_transport FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_transport.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
        AND user_profile.role IN ('org_owner', 'tour_operator', 'agent')
      )
    )
  )
);

-- Create RLS policies for quote_transfers_new
CREATE POLICY "Users can view transfers from their organization" 
ON public.quote_transfers_new FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_transfers_new.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
      )
    )
  )
);

CREATE POLICY "Users can modify transfers from their organization" 
ON public.quote_transfers_new FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_transfers_new.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
        AND user_profile.role IN ('org_owner', 'tour_operator', 'agent')
      )
    )
  )
);

-- Create RLS policies for quote_excursions
CREATE POLICY "Users can view excursions from their organization" 
ON public.quote_excursions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_excursions.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
      )
    )
  )
);

CREATE POLICY "Users can modify excursions from their organization" 
ON public.quote_excursions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_excursions.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
        AND user_profile.role IN ('org_owner', 'tour_operator', 'agent')
      )
    )
  )
);

-- Create RLS policies for quote_markup
CREATE POLICY "Users can view markup from their organization" 
ON public.quote_markup FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_markup.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
      )
    )
  )
);

CREATE POLICY "Users can modify markup from their organization" 
ON public.quote_markup FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.profiles p ON p.id::text = q.created_by
    WHERE q.id = quote_markup.quote_id
    AND (
      p.role = 'system_admin' 
      OR EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.id = auth.uid() 
        AND user_profile.org_id = p.org_id
        AND user_profile.role IN ('org_owner', 'tour_operator', 'agent')
      )
    )
  )
);

-- Create function to calculate quote summary
CREATE OR REPLACE FUNCTION public.calculate_quote_summary(quote_id_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  accommodation_cost NUMERIC := 0;
  transport_cost NUMERIC := 0;
  transfer_cost NUMERIC := 0;
  excursion_cost NUMERIC := 0;
  markup_percentage NUMERIC := 0;
  total_adults INTEGER := 0;
  total_children INTEGER := 0;
  total_infants INTEGER := 0;
  net_cost NUMERIC := 0;
  markup_cost NUMERIC := 0;
  total_cost NUMERIC := 0;
  summary JSONB;
BEGIN
  -- Calculate accommodation cost
  SELECT COALESCE(SUM(
    (no_adults * adult_cost) + 
    (no_cwb * cwb_cost) + 
    (no_cnb * cnb_cost) + 
    (no_infants * infant_cost)
  ), 0), 
  COALESCE(SUM(no_adults), 0),
  COALESCE(SUM(no_cwb + no_cnb), 0),
  COALESCE(SUM(no_infants), 0)
  INTO accommodation_cost, total_adults, total_children, total_infants
  FROM public.quote_accommodations 
  WHERE quote_id = quote_id_param;

  -- Calculate transport cost
  SELECT COALESCE(SUM((no_adults * adult_cost) + (no_children * child_cost)), 0)
  INTO transport_cost
  FROM public.quote_transport 
  WHERE quote_id = quote_id_param;

  -- Calculate transfer cost
  SELECT COALESCE(SUM((no_adults * adult_cost) + (no_children * child_cost)), 0)
  INTO transfer_cost
  FROM public.quote_transfers_new 
  WHERE quote_id = quote_id_param;

  -- Calculate excursion cost
  SELECT COALESCE(SUM((number_of_people * adult_cost) + (number_of_children * child_cost)), 0)
  INTO excursion_cost
  FROM public.quote_excursions 
  WHERE quote_id = quote_id_param;

  -- Get markup percentage
  SELECT COALESCE(markup_percentage, 0)
  INTO markup_percentage
  FROM public.quote_markup 
  WHERE quote_id = quote_id_param;

  -- Calculate totals
  net_cost := accommodation_cost + transport_cost + transfer_cost + excursion_cost;
  markup_cost := (net_cost * markup_percentage) / 100;
  total_cost := net_cost + markup_cost;

  -- Build summary JSON
  summary := jsonb_build_object(
    'number_of_adults', total_adults,
    'number_of_children', total_children,
    'number_of_infants', total_infants,
    'accommodation_cost', accommodation_cost,
    'transport_cost', transport_cost,
    'transfer_cost', transfer_cost,
    'excursion_cost', excursion_cost,
    'net_cost', net_cost,
    'markup_cost', markup_cost,
    'total_cost', total_cost,
    'markup_percentage', markup_percentage
  );

  RETURN summary;
END;
$$;

-- Create trigger to update summary_data when quote components change
CREATE OR REPLACE FUNCTION public.update_quote_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.quotes 
  SET summary_data = public.calculate_quote_summary(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.quote_id
      ELSE NEW.quote_id
    END
  ),
  updated_at = now()
  WHERE id = CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.quote_id
    ELSE NEW.quote_id
  END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for all quote component tables
CREATE TRIGGER trigger_update_quote_summary_accommodations
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_accommodations
  FOR EACH ROW EXECUTE FUNCTION public.update_quote_summary();

CREATE TRIGGER trigger_update_quote_summary_transport
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_transport
  FOR EACH ROW EXECUTE FUNCTION public.update_quote_summary();

CREATE TRIGGER trigger_update_quote_summary_transfers
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_transfers_new
  FOR EACH ROW EXECUTE FUNCTION public.update_quote_summary();

CREATE TRIGGER trigger_update_quote_summary_excursions
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_excursions
  FOR EACH ROW EXECUTE FUNCTION public.update_quote_summary();

CREATE TRIGGER trigger_update_quote_summary_markup
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_markup
  FOR EACH ROW EXECUTE FUNCTION public.update_quote_summary();
