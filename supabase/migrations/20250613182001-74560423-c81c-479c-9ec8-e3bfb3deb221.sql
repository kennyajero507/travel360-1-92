
-- Phase 1: Emergency Database Cleanup
-- This will fix critical database issues causing authentication problems

-- 1. Update all profiles with missing emails from auth.users table
UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND (profiles.email IS NULL OR profiles.email = '');

-- 2. Generate missing organization short_codes using the existing function
UPDATE public.organizations 
SET short_code = generate_org_short_code()
WHERE short_code IS NULL OR short_code = '';

-- 3. Extend trial periods for all organizations to allow development testing (30 days from now)
UPDATE public.organizations 
SET trial_end = now() + interval '30 days',
    subscription_status = 'trial'
WHERE trial_end < now() OR subscription_status = 'expired';

-- 4. Extend trial periods for individual profiles without organizations
UPDATE public.profiles 
SET trial_ends_at = now() + interval '30 days'
WHERE trial_ends_at < now() OR trial_ends_at IS NULL;

-- 5. Ensure all profiles have proper full_name from auth.users metadata or email
UPDATE public.profiles 
SET full_name = COALESCE(
  auth_users.raw_user_meta_data->>'full_name',
  auth_users.raw_user_meta_data->>'name',
  split_part(auth_users.email, '@', 1)
)
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND (profiles.full_name IS NULL OR profiles.full_name = '' OR profiles.full_name = 'User');

-- 6. Set default role for profiles without one
UPDATE public.profiles 
SET role = 'org_owner'
WHERE role IS NULL OR role = '';

-- 7. Create missing profiles for any auth.users that don't have profiles
INSERT INTO public.profiles (id, full_name, email, role, created_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1),
    'User'
  ) as full_name,
  au.email,
  'org_owner' as role,
  now() as created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 8. Ensure organizations have valid owner_id references
UPDATE public.organizations
SET owner_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.org_id = organizations.id 
  AND p.role = 'org_owner' 
  LIMIT 1
)
WHERE owner_id IS NULL OR NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = organizations.owner_id
);

-- 9. Fix any orphaned profiles (users with org_id pointing to non-existent organizations)
UPDATE public.profiles 
SET org_id = NULL
WHERE org_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = profiles.org_id);

-- 10. Set default currency preferences
UPDATE public.profiles 
SET preferred_currency = 'USD'
WHERE preferred_currency IS NULL OR preferred_currency = '';

UPDATE public.organizations 
SET default_currency = 'USD'
WHERE default_currency IS NULL OR default_currency = '';
