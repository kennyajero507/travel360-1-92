
-- Fix the super admin profile by linking it to the System Administration organization
-- First, ensure the System Administration organization exists
INSERT INTO organizations (name, owner_id)
SELECT 'System Administration', 'e31f9686-119d-4669-9164-5e20ae42f00b'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations WHERE name = 'System Administration'
);

-- Update the admin profile to link it to the System Administration organization
UPDATE profiles 
SET org_id = (
  SELECT id FROM organizations 
  WHERE name = 'System Administration' 
  LIMIT 1
)
WHERE email = 'admin@travelflow360.com';

-- Ensure the organization owner is set to the admin user
UPDATE organizations 
SET owner_id = 'e31f9686-119d-4669-9164-5e20ae42f00b'
WHERE name = 'System Administration';
