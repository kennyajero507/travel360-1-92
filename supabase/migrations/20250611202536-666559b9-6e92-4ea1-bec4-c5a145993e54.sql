
-- Add RLS policies for hotels table
CREATE POLICY "Users can view hotels from their organization" 
  ON public.hotels 
  FOR SELECT 
  USING (
    org_id IS NULL OR 
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin')
  );

CREATE POLICY "Users can create hotels" 
  ON public.hotels 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()) OR
     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin'))
  );

CREATE POLICY "Users can update hotels from their organization" 
  ON public.hotels 
  FOR UPDATE 
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin')
  );

CREATE POLICY "Users can delete hotels from their organization" 
  ON public.hotels 
  FOR DELETE 
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'system_admin')
  );

-- Enable RLS on hotels table
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Insert sample hotel data for testing
INSERT INTO public.hotels (
  id,
  name,
  destination,
  category,
  status,
  location,
  description,
  amenities,
  room_types,
  contact_info,
  pricing
) VALUES 
(
  gen_random_uuid(),
  'Grand Paradise Resort',
  'Maldives',
  '5 Star Luxury',
  'Active',
  'North Male Atoll',
  'Luxury overwater villas with pristine beaches and world-class service',
  '["WiFi", "Pool", "Spa", "Restaurant", "Bar", "Water Sports", "Dive Center"]',
  '[
    {
      "id": "villa-ocean",
      "name": "Ocean Villa",
      "maxOccupancy": 2,
      "bedOptions": "King Bed",
      "ratePerNight": 850,
      "amenities": ["Private Pool", "Ocean View", "Butler Service"],
      "totalUnits": 20
    },
    {
      "id": "villa-beach",
      "name": "Beach Villa",
      "maxOccupancy": 4,
      "bedOptions": "King + Sofa Bed",
      "ratePerNight": 650,
      "amenities": ["Beach Access", "Private Deck"],
      "totalUnits": 15
    }
  ]',
  '{"phone": "+960 123-4567", "email": "reservations@grandparadise.mv"}',
  '{"currency": "USD", "taxRate": 10, "serviceCharge": 12}'
),
(
  gen_random_uuid(),
  'Safari Lodge Kenya',
  'Kenya',
  '4 Star Safari',
  'Active',
  'Maasai Mara',
  'Authentic safari experience with game drives and cultural activities',
  '["WiFi", "Restaurant", "Bar", "Game Drives", "Cultural Tours", "Spa"]',
  '[
    {
      "id": "tent-luxury",
      "name": "Luxury Safari Tent",
      "maxOccupancy": 2,
      "bedOptions": "Queen Bed",
      "ratePerNight": 420,
      "amenities": ["Private Bathroom", "Game Viewing Deck"],
      "totalUnits": 12
    },
    {
      "id": "tent-family",
      "name": "Family Safari Tent",
      "maxOccupancy": 4,
      "bedOptions": "Queen + Twin Beds",
      "ratePerNight": 580,
      "amenities": ["Separate Kids Area", "Private Bathroom"],
      "totalUnits": 8
    }
  ]',
  '{"phone": "+254 700-123456", "email": "bookings@safarilodge.ke"}',
  '{"currency": "USD", "taxRate": 8, "serviceCharge": 10}'
),
(
  gen_random_uuid(),
  'Mountain View Hotel',
  'Switzerland',
  '4 Star Mountain',
  'Active',
  'Zermatt',
  'Alpine hotel with stunning Matterhorn views and ski access',
  '["WiFi", "Restaurant", "Bar", "Ski Storage", "Spa", "Fitness Center"]',
  '[
    {
      "id": "room-standard",
      "name": "Standard Room",
      "maxOccupancy": 2,
      "bedOptions": "Queen Bed",
      "ratePerNight": 320,
      "amenities": ["Mountain View", "Balcony"],
      "totalUnits": 25
    },
    {
      "id": "suite-alpine",
      "name": "Alpine Suite",
      "maxOccupancy": 4,
      "bedOptions": "King + Sofa Bed",
      "ratePerNight": 480,
      "amenities": ["Matterhorn View", "Living Area", "Fireplace"],
      "totalUnits": 10
    }
  ]',
  '{"phone": "+41 27 123-4567", "email": "info@mountainview.ch"}',
  '{"currency": "CHF", "taxRate": 7.7, "serviceCharge": 0}'
);
