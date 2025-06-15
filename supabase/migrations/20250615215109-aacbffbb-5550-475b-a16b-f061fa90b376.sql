
-- Update the admin user's role to 'system_admin' so that admin login works.
UPDATE profiles
SET role = 'system_admin'
WHERE email = 'admin@travelflow360.com';
