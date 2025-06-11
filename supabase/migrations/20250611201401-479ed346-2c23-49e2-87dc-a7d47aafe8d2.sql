
-- Create quote_packages table for grouping multiple quotes for client selection
CREATE TABLE public.quote_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_mobile TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  selected_quote_id TEXT,
  client_feedback TEXT,
  selection_date TIMESTAMP WITH TIME ZONE
);

-- Create quote_package_items table to link quotes to packages
CREATE TABLE public.quote_package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.quote_packages(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL DEFAULT 'Option',
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(package_id, quote_id)
);

-- Enable RLS on both tables
ALTER TABLE public.quote_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_package_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quote_packages
CREATE POLICY "Users can view quote packages from their organization" 
  ON public.quote_packages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.org_id = (
        SELECT p2.org_id FROM public.profiles p2 
        WHERE p2.id = created_by
      )
    )
  );

CREATE POLICY "Users can create quote packages" 
  ON public.quote_packages 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update quote packages from their organization" 
  ON public.quote_packages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.org_id = (
        SELECT p2.org_id FROM public.profiles p2 
        WHERE p2.id = created_by
      )
    )
  );

-- Create RLS policies for quote_package_items
CREATE POLICY "Users can view quote package items from their organization" 
  ON public.quote_package_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.quote_packages qp
      JOIN public.profiles p ON p.id = qp.created_by
      WHERE qp.id = package_id
      AND p.org_id = (
        SELECT p2.org_id FROM public.profiles p2 
        WHERE p2.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create quote package items" 
  ON public.quote_package_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quote_packages qp
      JOIN public.profiles p ON p.id = qp.created_by
      WHERE qp.id = package_id
      AND p.org_id = (
        SELECT p2.org_id FROM public.profiles p2 
        WHERE p2.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update quote package items from their organization" 
  ON public.quote_package_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.quote_packages qp
      JOIN public.profiles p ON p.id = qp.created_by
      WHERE qp.id = package_id
      AND p.org_id = (
        SELECT p2.org_id FROM public.profiles p2 
        WHERE p2.id = auth.uid()
      )
    )
  );

-- Create function to get quote package with items
CREATE OR REPLACE FUNCTION public.get_quote_package_with_items(package_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  package_data JSON;
  items_data JSON;
BEGIN
  -- Get package data
  SELECT row_to_json(qp) INTO package_data
  FROM public.quote_packages qp
  WHERE qp.id = package_id_param;
  
  -- Get items data with quote details
  SELECT json_agg(
    json_build_object(
      'id', qpi.id,
      'option_name', qpi.option_name,
      'is_selected', qpi.is_selected,
      'quote', row_to_json(q)
    )
  ) INTO items_data
  FROM public.quote_package_items qpi
  JOIN public.quotes q ON q.id = qpi.quote_id
  WHERE qpi.package_id = package_id_param;
  
  -- Return combined data
  RETURN json_build_object(
    'package', package_data,
    'items', COALESCE(items_data, '[]'::json)
  );
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_quote_packages_created_by ON public.quote_packages(created_by);
CREATE INDEX idx_quote_packages_status ON public.quote_packages(status);
CREATE INDEX idx_quote_package_items_package_id ON public.quote_package_items(package_id);
CREATE INDEX idx_quote_package_items_quote_id ON public.quote_package_items(quote_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_quote_package_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_quote_packages_timestamp
  BEFORE UPDATE ON public.quote_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quote_package_timestamp();
