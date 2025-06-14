
-- Add an org_id column to bookings for org-level security and reference
ALTER TABLE public.bookings
  ADD COLUMN org_id uuid;

-- Optional: Add a foreign key reference to organizations.id (not required for RLS, but helps integrity)
ALTER TABLE public.bookings
  ADD CONSTRAINT fk_bookings_org
  FOREIGN KEY (org_id) REFERENCES public.organizations(id);

-- Backfill org_id using the profiles/org relation via quotes table if possible
UPDATE public.bookings b
SET org_id = (
  SELECT p.org_id 
  FROM public.quotes q
  JOIN public.profiles p ON q.created_by = p.id::text
  WHERE q.id = b.quote_id
  LIMIT 1
)
WHERE org_id IS NULL;

-- Optionally, set org_id to NULL for bookings where it can't be inferred

-- Set NOT NULL constraint if you want all bookings to always be associated with an organization
-- ALTER TABLE public.bookings ALTER COLUMN org_id SET NOT NULL;

-- Now, the org_id column can be used in RLS policies
