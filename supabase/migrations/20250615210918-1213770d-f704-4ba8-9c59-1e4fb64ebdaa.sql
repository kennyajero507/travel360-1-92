
-- ===== PHASE 1: SYSTEM STABILIZATION - RLS POLICIES =====

-- 1. Ensure RLS is enabled & safe on quote_hotel_options
ALTER TABLE public.quote_hotel_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members manage quote hotel options" ON public.quote_hotel_options;
CREATE POLICY "Org members manage quote hotel options"
ON public.quote_hotel_options
FOR ALL
USING (
  quote_id IN (
    SELECT id FROM public.quotes WHERE 
      (created_by = auth.uid() OR 
        created_by IN (
            SELECT id FROM public.profiles 
            WHERE org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
        )
      )
  )
);

-- 2. Ensure RLS is enabled & safe on quote_packages
ALTER TABLE public.quote_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members manage quote packages" ON public.quote_packages;
CREATE POLICY "Org members manage quote packages"
ON public.quote_packages
FOR ALL
USING (
  created_by = auth.uid() 
  OR client_id = auth.uid()
  OR created_by IN (
      SELECT id FROM public.profiles 
      WHERE org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- 3. Add RLS protection to hotel_room_inventory, with organization isolation
ALTER TABLE public.hotel_room_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can manage their hotel room inventory" ON public.hotel_room_inventory;
CREATE POLICY "Org members can manage their hotel room inventory"
ON public.hotel_room_inventory
FOR ALL
USING (
  (SELECT org_id FROM public.hotels WHERE id = hotel_id) = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  (SELECT org_id FROM public.hotels WHERE id = hotel_id) = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
);

-- 4. Make sure notifications table is safe (users see their own notifications only)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User sees own notifications" ON public.notifications;
CREATE POLICY "User sees own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "User inserts own notifications" ON public.notifications;
CREATE POLICY "User inserts own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "User updates (mark as read) own notifications" ON public.notifications;
CREATE POLICY "User updates (mark as read) own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

-- 5. Email templates - Org isolation required
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members manage email templates" ON public.email_templates;
CREATE POLICY "Org members manage email templates"
ON public.email_templates
FOR ALL
USING (
  org_id IN (
    SELECT org_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- (Optional!) Do the same for quote_transfers_new, quote_transport, quote_markup if needed by the app

-- Review and apply as needed!
