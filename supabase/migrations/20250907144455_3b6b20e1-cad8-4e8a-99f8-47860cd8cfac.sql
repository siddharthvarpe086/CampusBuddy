-- Fix RLS policies for college_data to work without authentication
-- Drop existing faculty policy and create new one that allows all operations for faculty portal
DROP POLICY IF EXISTS "Faculty can manage college data" ON public.college_data;

-- Create new policy that allows all operations on college_data for faculty portal
-- Since we removed authentication, we'll allow all operations from faculty interface
CREATE POLICY "Allow faculty portal operations" 
ON public.college_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update the student view policy to remain the same
-- Students can still view all college data
-- (This policy already exists and works correctly)