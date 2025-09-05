-- Clear all existing college data and create fresh table
DELETE FROM public.college_data;

-- Update faculty credentials by creating a new user with correct email
-- First, we need to ensure the faculty user exists with the new credentials
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'faculty@college.in',
  crypt('12345678', gen_salt('bf')),
  now(),
  now(), 
  now(),
  '{"full_name": "Faculty Member", "user_type": "faculty"}'::jsonb
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('12345678', gen_salt('bf')),
  raw_user_meta_data = '{"full_name": "Faculty Member", "user_type": "faculty"}'::jsonb;

-- Ensure the profile exists for faculty user
INSERT INTO public.profiles (user_id, full_name, email, user_type)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Faculty Member',
  'faculty@college.in',
  'faculty'
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = 'Faculty Member',
  email = 'faculty@college.in',
  user_type = 'faculty';