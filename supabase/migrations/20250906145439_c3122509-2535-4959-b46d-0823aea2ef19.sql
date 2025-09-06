-- Create an edge function to handle faculty account creation with confirmed email
-- First, let's create a function that can properly create a confirmed faculty account

CREATE OR REPLACE FUNCTION public.create_faculty_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  faculty_user_id uuid;
  faculty_email text := 'keystone';
  faculty_password text := 'keystone';
  result json;
BEGIN
  -- Check if faculty profile already exists with the new credentials
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = faculty_email AND user_type = 'faculty'
  ) THEN
    SELECT json_build_object('success', true, 'message', 'Faculty account already exists') INTO result;
    RETURN result;
  END IF;
  
  -- For now, we'll handle this through the client with a workaround
  -- The actual user creation needs to be done through the auth API
  SELECT json_build_object('success', false, 'message', 'Use client-side creation') INTO result;
  RETURN result;
END;
$$;