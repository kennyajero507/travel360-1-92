
-- Create a table to manage daily room inventory for hotels
CREATE TABLE public.hotel_room_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_type_id TEXT NOT NULL,
  inventory_date DATE NOT NULL,
  booked_units INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(hotel_id, room_type_id, inventory_date)
);

-- Add a comment to describe the table
COMMENT ON TABLE public.hotel_room_inventory IS 'Stores daily booking counts for each hotel room type to manage availability.';

-- Enable Row Level Security
ALTER TABLE public.hotel_room_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies to ensure data privacy and security
CREATE POLICY "Org members can manage their hotel room inventory"
  ON public.hotel_room_inventory
  FOR ALL
  USING (
    (SELECT org_id FROM public.hotels WHERE id = hotel_id) = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    (SELECT org_id FROM public.hotels WHERE id = hotel_id) = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotel_room_inventory_hotel_id ON public.hotel_room_inventory(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_room_inventory_date ON public.hotel_room_inventory(inventory_date);
CREATE INDEX IF NOT EXISTS idx_hotel_room_inventory_hotel_room_date ON public.hotel_room_inventory(hotel_id, room_type_id, inventory_date);
