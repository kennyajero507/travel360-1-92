
-- Replace YOUR_EMAIL_HERE with your real email. Replace YOUR_PROFILE_ID with your uuid if known.

-- 1. Link user to the correct org (find your org id via organizations table)
UPDATE profiles
SET org_id = (SELECT id FROM organizations WHERE owner_id = profiles.id ORDER BY created_at DESC LIMIT 1)
WHERE email = '{YOUR_EMAIL_HERE}';

-- 2. (Optional): If demo user is missing, create it by signing up in the frontend, or add to auth dashboard then update profile:

UPDATE profiles
SET
  full_name = 'TravelFlow Demo',
  org_id = (SELECT id FROM organizations WHERE name = 'TravelFlow Demo Agency' LIMIT 1),
  role = 'org_owner'
WHERE email = 'demo@travelflow360.com';

-- 3. (Optional, if multiple orgs per user exist):
-- Keep only the latest org per user, delete others
WITH user_orgs AS (
  SELECT id FROM organizations
  WHERE owner_id = (SELECT id FROM profiles WHERE email = '{YOUR_EMAIL_HERE}')
  ORDER BY created_at DESC
)
DELETE FROM organizations
WHERE id IN (SELECT id FROM user_orgs OFFSET 1);

-- 4. (Optional): Create the demo agency if it does not exist
INSERT INTO organizations (name, owner_id, subscription_tier)
SELECT 'TravelFlow Demo Agency', null, 'starter'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations WHERE name = 'TravelFlow Demo Agency'
);
