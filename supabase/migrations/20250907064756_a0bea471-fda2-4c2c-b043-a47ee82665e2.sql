-- Enhanced quotes system with multi-option support and better tracking

-- 1. Create quote options table for multi-option quotes
CREATE TABLE public.quote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  option_description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  inclusions JSONB DEFAULT '[]'::jsonb,
  exclusions JSONB DEFAULT '[]'::jsonb,
  hotel_details JSONB DEFAULT '{}'::jsonb,
  transport_details JSONB DEFAULT '{}'::jsonb,
  activity_details JSONB DEFAULT '{}'::jsonb,
  is_recommended BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create quote interactions table for tracking client engagement
CREATE TABLE public.quote_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'viewed', 'downloaded', 'accepted', 'rejected', 'feedback'
  client_email TEXT,
  client_ip_address INET,
  interaction_data JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create quote templates table
CREATE TABLE public.quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_description TEXT,
  destination TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  duration_nights INTEGER NOT NULL,
  base_inclusions JSONB DEFAULT '[]'::jsonb,
  base_exclusions JSONB DEFAULT '[]'::jsonb,
  default_hotels JSONB DEFAULT '[]'::jsonb,
  default_activities JSONB DEFAULT '[]'::jsonb,
  default_transport JSONB DEFAULT '{}'::jsonb,
  pricing_structure JSONB DEFAULT '{}'::jsonb,
  terms_conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create quote approvals table for workflow management
CREATE TABLE public.quote_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  approval_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approval_notes TEXT,
  approval_level INTEGER DEFAULT 1,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create quote analytics table
CREATE TABLE public.quote_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Add enhanced columns to existing quotes table
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS quote_type TEXT DEFAULT 'standard'; -- 'standard', 'multi_option', 'template_based'
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS client_portal_token TEXT UNIQUE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS client_viewed_at TIMESTAMPTZ;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS client_response_deadline TIMESTAMPTZ;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS terms_conditions TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS inclusions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS exclusions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'not_required'; -- 'not_required', 'pending', 'approved', 'rejected'
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS sent_to_client_at TIMESTAMPTZ;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS last_follow_up_at TIMESTAMPTZ;

-- Enable RLS for new tables
ALTER TABLE public.quote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quote_options
CREATE POLICY "Org members can manage quote options" ON public.quote_options
FOR ALL USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE org_id = get_user_organization()
  )
);

-- RLS Policies for quote_interactions (public read for client portal)
CREATE POLICY "Org members can view quote interactions" ON public.quote_interactions
FOR SELECT USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE org_id = get_user_organization()
  )
);

CREATE POLICY "Public can insert quote interactions" ON public.quote_interactions
FOR INSERT WITH CHECK (true);

-- RLS Policies for quote_templates
CREATE POLICY "Org members can manage quote templates" ON public.quote_templates
FOR ALL USING (org_id = get_user_organization());

-- RLS Policies for quote_approvals
CREATE POLICY "Org members can view quote approvals" ON public.quote_approvals
FOR SELECT USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE org_id = get_user_organization()
  )
);

CREATE POLICY "Approvers can manage their approvals" ON public.quote_approvals
FOR ALL USING (
  approver_id = auth.uid() OR
  quote_id IN (
    SELECT id FROM public.quotes WHERE org_id = get_user_organization() AND created_by = auth.uid()
  )
);

-- RLS Policies for quote_analytics
CREATE POLICY "Org members can view quote analytics" ON public.quote_analytics
FOR ALL USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE org_id = get_user_organization()
  )
);

-- Create indexes for performance
CREATE INDEX idx_quote_options_quote_id ON public.quote_options(quote_id);
CREATE INDEX idx_quote_interactions_quote_id ON public.quote_interactions(quote_id);
CREATE INDEX idx_quote_interactions_type_created ON public.quote_interactions(interaction_type, created_at);
CREATE INDEX idx_quote_templates_org_id ON public.quote_templates(org_id);
CREATE INDEX idx_quote_templates_active ON public.quote_templates(is_active);
CREATE INDEX idx_quote_approvals_quote_id ON public.quote_approvals(quote_id);
CREATE INDEX idx_quote_approvals_status ON public.quote_approvals(approval_status);
CREATE INDEX idx_quote_analytics_quote_id ON public.quote_analytics(quote_id);
CREATE INDEX idx_quotes_client_portal_token ON public.quotes(client_portal_token);
CREATE INDEX idx_quotes_type_status ON public.quotes(quote_type, status);

-- Create function to generate client portal token
CREATE OR REPLACE FUNCTION public.generate_client_portal_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'qpt_' || encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Create trigger to auto-generate client portal token
CREATE OR REPLACE FUNCTION public.set_client_portal_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_portal_token IS NULL THEN
    NEW.client_portal_token := public.generate_client_portal_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_client_portal_token
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_client_portal_token();

-- Create function to update quote analytics
CREATE OR REPLACE FUNCTION public.log_quote_metric(
  p_quote_id UUID,
  p_metric_name TEXT,
  p_metric_value NUMERIC DEFAULT NULL,
  p_metric_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.quote_analytics (
    quote_id,
    metric_name,
    metric_value,
    metric_data,
    recorded_at
  ) VALUES (
    p_quote_id,
    p_metric_name,
    p_metric_value,
    p_metric_data,
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;