-- Create faculty user account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'TeamFaculty',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert corresponding profile for faculty user
INSERT INTO public.profiles (user_id, full_name, email, user_type)
SELECT 
  id,
  'Faculty Admin',
  'TeamFaculty',
  'faculty'
FROM auth.users 
WHERE email = 'TeamFaculty';