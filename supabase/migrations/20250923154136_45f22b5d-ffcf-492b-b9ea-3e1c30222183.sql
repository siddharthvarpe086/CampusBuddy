-- Update the handle_new_user function to include academic fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, user_type, division, year_of_study, branch, roll_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
    NEW.raw_user_meta_data->>'division',
    CASE 
      WHEN NEW.raw_user_meta_data->>'year_of_study' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'year_of_study')::INTEGER
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'roll_number'
  );
  RETURN NEW;
END;
$$;