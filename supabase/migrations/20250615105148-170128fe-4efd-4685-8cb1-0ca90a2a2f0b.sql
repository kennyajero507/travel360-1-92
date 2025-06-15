
-- 1. Insert three sample hotels
insert into hotels (id, name, destination, category, status, created_at)
values
  (gen_random_uuid(), 'Blue Ocean Resort', 'Mombasa', 'Beach', 'Active', now()),
  (gen_random_uuid(), 'Highland Safari Lodge', 'Arusha', 'Safari', 'Active', now()),
  (gen_random_uuid(), 'Urban Oasis Hotel', 'Nairobi', 'City', 'Active', now());

-- 2. Insert three sample inquiries (with generated IDs)
insert into inquiries (
  id, org_id, tour_type, client_name, client_mobile, destination, check_in_date, check_out_date, adults, children, infants, num_rooms, created_by, created_at, status
) values
  (gen_random_uuid(), null, 'domestic', 'Jane Doe', '0712345678', 'Mombasa', CURRENT_DATE + 10, CURRENT_DATE + 14, 2, 1, 0, 1, null, now(), 'New'),
  (gen_random_uuid(), null, 'international', 'John Smith', '0798765432', 'Arusha', CURRENT_DATE + 20, CURRENT_DATE + 25, 3, 0, 1, 2, null, now(), 'New'),
  (gen_random_uuid(), null, 'domestic', 'Alice Brown', '0722112233', 'Nairobi', CURRENT_DATE + 5, CURRENT_DATE + 7, 1, 2, 0, 1, null, now(), 'New');

-- 3. Insert two sample quotes and link to the above inquiries and hotels
-- We'll use inquiry/destination names assumed above for demonstration
insert into quotes (
  id, inquiry_id, client, destination, start_date, end_date, adults, children_with_bed, infants, tour_type, status, currency_code, markup_type, markup_value, created_at
) values
  (gen_random_uuid(), (select id from inquiries where client_name = 'Jane Doe' limit 1), 'Jane Doe', 'Mombasa', CURRENT_DATE + 10, CURRENT_DATE + 14, 2, 1, 0, 'domestic', 'draft', 'USD', 'percentage', 20, now()),
  (gen_random_uuid(), (select id from inquiries where client_name = 'John Smith' limit 1), 'John Smith', 'Arusha', CURRENT_DATE + 20, CURRENT_DATE + 25, 3, 0, 1, 'international', 'draft', 'USD', 'percentage', 15, now());
