
-- First, let's add some sample hotels to work with
INSERT INTO public.hotels (id, name, category, destination, description, address, location, status, created_by, org_id, room_types, amenities, contact_info, pricing, policies, images, additional_details) VALUES
(
  gen_random_uuid(),
  'Grand Palace Hotel',
  '5-Star',
  'Mumbai',
  'Luxury hotel in the heart of Mumbai with world-class amenities and service.',
  '123 Marine Drive, Mumbai, Maharashtra 400001',
  'Marine Drive, Mumbai',
  'Active',
  'system',
  NULL,
  '[
    {"name": "Deluxe Room", "rate": 150, "childRate": 105, "childNoBedrRate": 75, "capacity": 2, "description": "Spacious room with city view"},
    {"name": "Executive Suite", "rate": 250, "childRate": 175, "childNoBedrRate": 125, "capacity": 4, "description": "Luxury suite with separate living area"},
    {"name": "Presidential Suite", "rate": 500, "childRate": 350, "childNoBedrRate": 250, "capacity": 6, "description": "Ultimate luxury with panoramic city views"}
  ]'::jsonb,
  '["Free WiFi", "Swimming Pool", "Spa", "Fitness Center", "Business Center", "Restaurant", "Room Service", "Concierge", "Valet Parking"]'::jsonb,
  '{"phone": "+91-22-1234-5678", "email": "reservations@grandpalace.com", "website": "www.grandpalace.com"}'::jsonb,
  '{"currency": "USD", "taxRate": 18, "serviceFee": 10}'::jsonb,
  '{"checkIn": "14:00", "checkOut": "12:00", "cancellation": "24 hours", "petPolicy": "Pets allowed with fee"}'::jsonb,
  '["https://example.com/hotel1-1.jpg", "https://example.com/hotel1-2.jpg"]'::jsonb,
  '{"starRating": 5, "yearBuilt": 2018, "lastRenovated": 2022}'::jsonb
),
(
  gen_random_uuid(),
  'Heritage Resort & Spa',
  '4-Star',
  'Mumbai',
  'Beautiful heritage property with modern amenities and traditional charm.',
  '456 Juhu Beach Road, Mumbai, Maharashtra 400049',
  'Juhu Beach, Mumbai',
  'Active',
  'system',
  NULL,
  '[
    {"name": "Standard Room", "rate": 100, "childRate": 70, "childNoBedrRate": 50, "capacity": 2, "description": "Comfortable room with garden view"},
    {"name": "Deluxe Room", "rate": 140, "childRate": 98, "childNoBedrRate": 70, "capacity": 2, "description": "Spacious room with partial sea view"},
    {"name": "Sea View Suite", "rate": 220, "childRate": 154, "childNoBedrRate": 110, "capacity": 4, "description": "Suite with direct sea view"}
  ]'::jsonb,
  '["Free WiFi", "Swimming Pool", "Spa", "Beach Access", "Restaurant", "Bar", "Room Service", "Parking"]'::jsonb,
  '{"phone": "+91-22-2234-5678", "email": "info@heritageresort.com", "website": "www.heritageresort.com"}'::jsonb,
  '{"currency": "USD", "taxRate": 18, "serviceFee": 8}'::jsonb,
  '{"checkIn": "15:00", "checkOut": "11:00", "cancellation": "48 hours", "petPolicy": "No pets allowed"}'::jsonb,
  '["https://example.com/hotel2-1.jpg", "https://example.com/hotel2-2.jpg"]'::jsonb,
  '{"starRating": 4, "yearBuilt": 2015, "lastRenovated": 2021}'::jsonb
),
(
  gen_random_uuid(),
  'Business Inn Downtown',
  '3-Star',
  'Mumbai',
  'Modern business hotel with excellent connectivity and professional services.',
  '789 Nariman Point, Mumbai, Maharashtra 400021',
  'Nariman Point, Mumbai',
  'Active',
  'system',
  NULL,
  '[
    {"name": "Standard Room", "rate": 80, "childRate": 56, "childNoBedrRate": 40, "capacity": 2, "description": "Modern room with business amenities"},
    {"name": "Business Room", "rate": 110, "childRate": 77, "childNoBedrRate": 55, "capacity": 2, "description": "Enhanced room with workspace"},
    {"name": "Family Room", "rate": 160, "childRate": 112, "childNoBedrRate": 80, "capacity": 4, "description": "Spacious room for families"}
  ]'::jsonb,
  '["Free WiFi", "Business Center", "Conference Rooms", "Restaurant", "Gym", "Laundry Service", "Airport Shuttle"]'::jsonb,
  '{"phone": "+91-22-3234-5678", "email": "reservations@businessinn.com", "website": "www.businessinn.com"}'::jsonb,
  '{"currency": "USD", "taxRate": 18, "serviceFee": 5}'::jsonb,
  '{"checkIn": "14:00", "checkOut": "12:00", "cancellation": "24 hours", "petPolicy": "No pets allowed"}'::jsonb,
  '["https://example.com/hotel3-1.jpg", "https://example.com/hotel3-2.jpg"]'::jsonb,
  '{"starRating": 3, "yearBuilt": 2020, "lastRenovated": 2023}'::jsonb
),
(
  gen_random_uuid(),
  'Taj Palace New Delhi',
  '5-Star',
  'Delhi',
  'Iconic luxury hotel in the diplomatic enclave with world-renowned service.',
  '2 Sardar Patel Marg, New Delhi 110021',
  'Diplomatic Enclave, New Delhi',
  'Active',
  'system',
  NULL,
  '[
    {"name": "Superior Room", "rate": 180, "childRate": 126, "childNoBedrRate": 90, "capacity": 2, "description": "Elegant room with city or garden view"},
    {"name": "Luxury Suite", "rate": 350, "childRate": 245, "childNoBedrRate": 175, "capacity": 4, "description": "Spacious suite with separate living room"},
    {"name": "Presidential Suite", "rate": 800, "childRate": 560, "childNoBedrRate": 400, "capacity": 6, "description": "Ultimate luxury with butler service"}
  ]'::jsonb,
  '["Free WiFi", "Multiple Restaurants", "Spa", "Swimming Pool", "Fitness Center", "Business Center", "Concierge", "Valet Parking", "Butler Service"]'::jsonb,
  '{"phone": "+91-11-6656-1234", "email": "reservations@tajpalace.com", "website": "www.tajhotels.com"}'::jsonb,
  '{"currency": "USD", "taxRate": 18, "serviceFee": 12}'::jsonb,
  '{"checkIn": "15:00", "checkOut": "12:00", "cancellation": "24 hours", "petPolicy": "Pets allowed with premium fee"}'::jsonb,
  '["https://example.com/hotel4-1.jpg", "https://example.com/hotel4-2.jpg"]'::jsonb,
  '{"starRating": 5, "yearBuilt": 1988, "lastRenovated": 2022}'::jsonb
),
(
  gen_random_uuid(),
  'Hotel Metropolis',
  '4-Star',
  'Delhi',
  'Contemporary hotel in the heart of Delhi with modern amenities.',
  '12 Karol Bagh, New Delhi 110005',
  'Karol Bagh, New Delhi',
  'Active',
  'system',
  NULL,
  '[
    {"name": "Standard Room", "rate": 95, "childRate": 67, "childNoBedrRate": 48, "capacity": 2, "description": "Modern room with city view"},
    {"name": "Deluxe Room", "rate": 130, "childRate": 91, "childNoBedrRate": 65, "capacity": 2, "description": "Upgraded room with premium amenities"},
    {"name": "Executive Suite", "rate": 200, "childRate": 140, "childNoBedrRate": 100, "capacity": 4, "description": "Suite with separate seating area"}
  ]'::jsonb,
  '["Free WiFi", "Restaurant", "Bar", "Fitness Center", "Business Center", "Room Service", "Laundry", "Parking"]'::jsonb,
  '{"phone": "+91-11-4567-8901", "email": "info@hotelmetropolis.com", "website": "www.hotelmetropolis.com"}'::jsonb,
  '{"currency": "USD", "taxRate": 18, "serviceFee": 8}'::jsonb,
  '{"checkIn": "14:00", "checkOut": "11:00", "cancellation": "48 hours", "petPolicy": "Small pets allowed"}'::jsonb,
  '["https://example.com/hotel5-1.jpg", "https://example.com/hotel5-2.jpg"]'::jsonb,
  '{"starRating": 4, "yearBuilt": 2017, "lastRenovated": 2023}'::jsonb
);

-- Create some sample inquiries to link quotes to
INSERT INTO public.inquiries (id, enquiry_number, tour_type, client_name, client_mobile, client_email, destination, check_in_date, check_out_date, adults, children, infants, num_rooms, status, priority, description, created_by) VALUES
(
  'inq-001',
  'ENQ-2501-001',
  'domestic',
  'John Smith',
  '+91-9876543210',
  'john.smith@email.com',
  'Mumbai',
  '2025-02-15',
  '2025-02-18',
  2,
  1,
  0,
  1,
  'New',
  'Normal',
  'Family vacation to Mumbai with sightseeing',
  'system'
),
(
  'inq-002',
  'ENQ-2501-002',
  'domestic',
  'Sarah Johnson',
  '+91-9876543211',
  'sarah.johnson@email.com',
  'Delhi',
  '2025-03-10',
  '2025-03-14',
  4,
  2,
  1,
  2,
  'New',
  'High',
  'Business trip with family extension',
  'system'
);
