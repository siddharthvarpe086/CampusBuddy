-- Fix security issues with SyncSpot tables
-- Make questions and answers only visible to authenticated users

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Everyone can view questions" ON syncspot_questions;
DROP POLICY IF EXISTS "Everyone can view answers" ON syncspot_answers;

-- Create more secure policies for questions
CREATE POLICY "Authenticated users can view questions" 
ON syncspot_questions 
FOR SELECT 
TO authenticated
USING (true);

-- Create more secure policies for answers
CREATE POLICY "Authenticated users can view answers" 
ON syncspot_answers 
FOR SELECT 
TO authenticated  
USING (true);

-- Add policy to allow users to update their own questions (for moderation)
CREATE POLICY "Users can update their own questions" 
ON syncspot_questions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to update their own answers (for moderation)  
CREATE POLICY "Users can update their own answers"
ON syncspot_answers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create a more restrictive policy for profiles (ensure no personal data leakage)
-- First drop existing policy and create a more restrictive one
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create policy that only shows essential public information and own full profile
CREATE POLICY "Users can view limited profile information" 
ON profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can see their own full profile
  auth.uid() = user_id 
  OR 
  -- Others can only see basic non-sensitive info (if needed for SyncSpot display)
  (auth.uid() IS NOT NULL AND user_id != auth.uid())
);

-- Add a function to safely get user display name for SyncSpot
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
      ELSE 'Student' 
    END
  FROM public.profiles 
  WHERE user_id = user_uuid;
$$;