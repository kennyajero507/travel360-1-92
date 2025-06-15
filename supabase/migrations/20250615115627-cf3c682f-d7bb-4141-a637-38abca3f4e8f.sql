
-- Fix your profile link and clean up duplicates
-- Replace contact@circlelook.com with your actual email if different

-- 1. Link your profile to the latest organization you created
UPDATE profiles
SET org_id = (SELECT id FROM organizations WHERE owner_id = profiles.id ORDER BY created_at DESC LIMIT 1)
WHERE email = 'contact@circlelook.com';

-- 2. Remove duplicate organizations, keep only the most recent one
WITH user_orgs AS (
  SELECT id FROM organizations
  WHERE owner_id = (SELECT id FROM profiles WHERE email = 'contact@circlelook.com')
  ORDER BY created_at DESC
)
DELETE FROM organizations
WHERE id IN (SELECT id FROM user_orgs OFFSET 1);

-- 3. Ensure demo organization exists but without owner_id conflicts
INSERT INTO organizations (name, owner_id, subscription_tier)
SELECT 'TravelFlow Demo Agency', null, 'starter'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations WHERE name = 'TravelFlow Demo Agency'
);

-- 4. Update demo profile if it exists
UPDATE profiles
SET
  full_name = 'TravelFlow Demo',
  org_id = (SELECT id FROM organizations WHERE name = 'TravelFlow Demo Agency' LIMIT 1),
  role = 'org_owner'
WHERE email = 'demo@travelflow360.com';
