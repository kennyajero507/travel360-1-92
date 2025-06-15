
-- 1. Remove duplicate organizations, keep only the most recent for your user
WITH user_orgs AS (
  SELECT id FROM organizations
  WHERE owner_id = (SELECT id FROM profiles WHERE email = '{YOUR_EMAIL_HERE}')  -- Replace YOUR_EMAIL_HERE!
  ORDER BY created_at DESC
)
DELETE FROM organizations
WHERE id IN (SELECT id FROM user_orgs OFFSET 1);

-- 2. Link your profile to your latest organization
UPDATE profiles
SET org_id = (SELECT id FROM organizations WHERE owner_id = profiles.id ORDER BY created_at DESC LIMIT 1)
WHERE email = '{YOUR_EMAIL_HERE}';  -- Replace YOUR_EMAIL_HERE!

-- 3. Create the demo organization (if not exists)
INSERT INTO organizations (name, owner_id, subscription_tier)
SELECT 'TravelFlow Demo Agency', null, 'starter'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations WHERE name = 'TravelFlow Demo Agency'
);

-- 4. If you have already invited demo@travelflow360.com, update its profile
UPDATE profiles
SET
    full_name = 'TravelFlow Demo',
    org_id = (SELECT id FROM organizations WHERE name = 'TravelFlow Demo Agency' LIMIT 1),
    role = 'org_owner'
WHERE email = 'demo@travelflow360.com';

-- 5. Create sample hotels for demo org
INSERT INTO hotels (name, destination, category, status, org_id, created_at)
SELECT 'Demo Blue Ocean Resort', 'Mombasa', 'Beach', 'Active', o.id, now()
FROM organizations o WHERE o.name = 'TravelFlow Demo Agency'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, destination, category, status, org_id, created_at)
SELECT 'Demo Highland Safari Lodge', 'Arusha', 'Safari', 'Active', o.id, now()
FROM organizations o WHERE o.name = 'TravelFlow Demo Agency'
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, destination, category, status, org_id, created_at)
SELECT 'Demo Urban Oasis Hotel', 'Nairobi', 'City', 'Active', o.id, now()
FROM organizations o WHERE o.name = 'TravelFlow Demo Agency'
ON CONFLICT DO NOTHING;

-- 6. Create sample inquiry for the demo org
INSERT INTO inquiries (
  id, org_id, tour_type, client_name, client_mobile, destination, check_in_date, check_out_date, adults, children, infants, num_rooms, created_by, created_at, status
) SELECT
  gen_random_uuid(), o.id, 'domestic', 'Demo Jane Doe', '0712345678', 'Mombasa', CURRENT_DATE + 10, CURRENT_DATE + 14, 2, 1, 0, 1, null, now(), 'New'
FROM organizations o WHERE o.name = 'TravelFlow Demo Agency'
ON CONFLICT DO NOTHING;

-- 7. Create sample quote for that inquiry
INSERT INTO quotes (
  id, inquiry_id, client, destination, start_date, end_date, adults, children_with_bed, infants, tour_type, status, currency_code, markup_type, markup_value, created_at
) SELECT
  gen_random_uuid(),
  (SELECT i.id FROM inquiries i WHERE i.client_name = 'Demo Jane Doe' AND i.org_id = (SELECT id FROM organizations WHERE name = 'TravelFlow Demo Agency' LIMIT 1) LIMIT 1),
  'Demo Jane Doe', 'Mombasa', CURRENT_DATE + 10, CURRENT_DATE + 14, 2, 1, 0, 'domestic', 'draft', 'USD', 'percentage', 10, now()
WHERE EXISTS (SELECT 1 FROM organizations WHERE name = 'TravelFlow Demo Agency')
ON CONFLICT DO NOTHING;

