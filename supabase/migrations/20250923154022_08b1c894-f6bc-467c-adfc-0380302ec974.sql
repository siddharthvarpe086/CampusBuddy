-- Add academic fields to profiles table for student information
ALTER TABLE public.profiles 
ADD COLUMN division TEXT,
ADD COLUMN year_of_study INTEGER,
ADD COLUMN branch TEXT,
ADD COLUMN roll_number TEXT;

-- Add index on roll_number for uniqueness within branch/year combinations if needed
CREATE INDEX idx_profiles_roll_number ON public.profiles(roll_number, branch, year_of_study) WHERE roll_number IS NOT NULL;