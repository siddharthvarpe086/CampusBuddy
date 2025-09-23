-- Fix security issues with SyncSpot tables - Updated approach
-- First check and drop existing policies, then recreate them securely

-- Fix syncspot_questions policies
DROP POLICY IF EXISTS "Everyone can view questions" ON syncspot_questions;
DROP POLICY IF EXISTS "Authenticated users can view questions" ON syncspot_questions;

CREATE POLICY "Authenticated users can view questions" 
ON syncspot_questions 
FOR SELECT 
TO authenticated
USING (true);

-- Add update policy for questions (for user to edit their own)
DROP POLICY IF EXISTS "Users can update their own questions" ON syncspot_questions;

CREATE POLICY "Users can update their own questions" 
ON syncspot_questions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix syncspot_answers policies  
DROP POLICY IF EXISTS "Everyone can view answers" ON syncspot_answers;
DROP POLICY IF EXISTS "Authenticated users can view answers" ON syncspot_answers;

CREATE POLICY "Authenticated users can view answers" 
ON syncspot_answers 
FOR SELECT 
TO authenticated  
USING (true);

-- Add update policy for answers
DROP POLICY IF EXISTS "Users can update their own answers" ON syncspot_answers;

CREATE POLICY "Users can update their own answers"
ON syncspot_answers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create a secure function to get user display name (privacy-focused)
CREATE OR REPLACE FUNCTION public.get_user_display_name(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN full_name IS NOT NULL AND full_name != '' 
      THEN split_part(full_name, ' ', 1) -- Only first name for privacy
      ELSE 'Anonymous Student' 
    END
  FROM public.profiles 
  WHERE user_id = user_uuid;
$$;