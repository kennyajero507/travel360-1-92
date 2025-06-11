
-- Create email templates table for automated communications
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('booking_confirmation', 'status_update', 'payment_reminder', 'voucher_delivery')),
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table for client communications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  booking_id UUID REFERENCES public.bookings(id),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment tracking table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  amount NUMERIC NOT NULL,
  currency_code TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  payment_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create booking analytics table for performance tracking
CREATE TABLE public.booking_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  revenue NUMERIC NOT NULL DEFAULT 0,
  profit_margin NUMERIC DEFAULT 0,
  booking_source TEXT,
  conversion_days INTEGER,
  client_satisfaction_score INTEGER CHECK (client_satisfaction_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create voucher templates table
CREATE TABLE public.voucher_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_content JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_templates ENABLE ROW LEVEL SECURITY;

-- Email templates policies
CREATE POLICY "Users can view org email templates" ON public.email_templates
  FOR SELECT USING (organization_id = get_user_organization());

CREATE POLICY "Users can manage org email templates" ON public.email_templates
  FOR ALL USING (organization_id = get_user_organization());

-- Notifications policies
CREATE POLICY "Users can view org notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.profiles p ON b.agent_id = p.id::text
      WHERE b.id = notifications.booking_id 
      AND p.org_id = get_user_organization()
    )
  );

CREATE POLICY "Users can manage org notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.profiles p ON b.agent_id = p.id::text
      WHERE b.id = notifications.booking_id 
      AND p.org_id = get_user_organization()
    )
  );

-- Payments policies
CREATE POLICY "Users can view org payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.profiles p ON b.agent_id = p.id::text
      WHERE b.id = payments.booking_id 
      AND p.org_id = get_user_organization()
    )
  );

CREATE POLICY "Users can manage org payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.profiles p ON b.agent_id = p.id::text
      WHERE b.id = payments.booking_id 
      AND p.org_id = get_user_organization()
    )
  );

-- Booking analytics policies
CREATE POLICY "Users can view org analytics" ON public.booking_analytics
  FOR SELECT USING (organization_id = get_user_organization());

CREATE POLICY "Users can manage org analytics" ON public.booking_analytics
  FOR ALL USING (organization_id = get_user_organization());

-- Voucher templates policies
CREATE POLICY "Users can view org voucher templates" ON public.voucher_templates
  FOR SELECT USING (organization_id = get_user_organization());

CREATE POLICY "Users can manage org voucher templates" ON public.voucher_templates
  FOR ALL USING (organization_id = get_user_organization());

-- Create function to generate booking analytics
CREATE OR REPLACE FUNCTION public.generate_booking_analytics(booking_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_id UUID;
  booking_record public.bookings;
  org_id UUID;
BEGIN
  -- Get booking data
  SELECT * INTO booking_record FROM public.bookings WHERE id = booking_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Get organization ID from agent
  SELECT p.org_id INTO org_id 
  FROM public.profiles p 
  WHERE p.id = booking_record.agent_id::UUID;
  
  -- Insert analytics record
  INSERT INTO public.booking_analytics (
    booking_id,
    organization_id,
    revenue,
    created_at
  ) VALUES (
    booking_id_param,
    org_id,
    booking_record.total_price,
    now()
  ) RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$;

-- Create trigger to auto-generate analytics when booking is confirmed
CREATE OR REPLACE FUNCTION public.trigger_booking_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    PERFORM public.generate_booking_analytics(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to bookings table
DROP TRIGGER IF EXISTS booking_analytics_trigger ON public.bookings;
CREATE TRIGGER booking_analytics_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_booking_analytics();
