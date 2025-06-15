
-- Add org_id column to bookings (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='bookings' AND column_name='org_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN org_id uuid;
  END IF;
END $$;

-- Backfill bookings.org_id using quote->created_by->profiles->org_id, no casts needed
UPDATE public.bookings b
SET org_id = (
  SELECT p.org_id 
  FROM public.quotes q
  JOIN public.profiles p ON q.created_by = p.id
  WHERE q.id = b.quote_id
  LIMIT 1
)
WHERE org_id IS NULL
  AND quote_id IS NOT NULL;

-- Add org_id column to clients (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clients' AND column_name='org_id'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN org_id uuid;
  END IF;
END $$;

-- Backfill clients.org_id by matching created_by to profiles
UPDATE public.clients
SET org_id = (
  SELECT org_id FROM public.profiles p WHERE p.id = clients.created_by LIMIT 1
)
WHERE org_id IS NULL
  AND created_by IS NOT NULL;

-- Add org_id column to hotels (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='hotels' AND column_name='org_id'
  ) THEN
    ALTER TABLE public.hotels ADD COLUMN org_id uuid;
  END IF;
END $$;

-- Backfill hotels.org_id using created_by->profiles
UPDATE public.hotels
SET org_id = (
  SELECT org_id FROM public.profiles p WHERE p.id = hotels.created_by LIMIT 1
)
WHERE org_id IS NULL
  AND created_by IS NOT NULL;

-- Add org_id column to inquiries (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='inquiries' AND column_name='org_id'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN org_id uuid;
  END IF;
END $$;

-- Backfill inquiries.org_id using created_by->profiles
UPDATE public.inquiries
SET org_id = (
  SELECT org_id FROM public.profiles p WHERE p.id = inquiries.created_by LIMIT 1
)
WHERE org_id IS NULL
  AND created_by IS NOT NULL;

-- (Optional) Add org_id column to other tables if you'd like org isolation everywhere, and use the same pattern.
