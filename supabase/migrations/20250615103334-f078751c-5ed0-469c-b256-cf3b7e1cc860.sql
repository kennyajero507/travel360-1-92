
-- 1. Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  related_id TEXT,
  related_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: users see only their notifications
CREATE POLICY "User sees own notifications"
ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "User inserts own notifications"
ON public.notifications
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "User updates (mark as read) own notifications"
ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- 2. Quote Hotel Options Table
CREATE TABLE public.quote_hotel_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  option_name TEXT,
  total_price NUMERIC,
  currency_code TEXT,
  is_selected BOOLEAN DEFAULT false,
  room_arrangements JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quote_hotel_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members manage quote hotel options"
ON public.quote_hotel_options
FOR ALL
USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE (created_by = auth.uid() OR created_by IN (SELECT id FROM public.profiles WHERE org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())))
  )
);

-- 3. Quote Packages Table
CREATE TABLE public.quote_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  quote_ids UUID[] NOT NULL,
  client_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quote_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members manage quote packages"
ON public.quote_packages
FOR ALL
USING (
  created_by = auth.uid() OR client_id = auth.uid() OR created_by IN (SELECT id FROM public.profiles WHERE org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()))
);

-- 4. Email Templates Table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB,
  org_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members manage email templates"
ON public.email_templates
FOR ALL
USING (
  org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())
);

-- Enable realtime for notifications + quote_hotel_options
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.notifications SET (
  autovacuum_enabled = true,
  toast.autovacuum_enabled = true
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_hotel_options REPLICA IDENTITY FULL;
ALTER TABLE public.quote_hotel_options ENABLE ROW LEVEL SECURITY;
