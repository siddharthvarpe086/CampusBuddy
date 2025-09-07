-- Remove foreign key constraint on college_data.created_by since we're not using authentication
-- for faculty operations and make the field nullable
ALTER TABLE public.college_data DROP CONSTRAINT IF EXISTS college_data_created_by_fkey;

-- Make created_by nullable since we're not enforcing user relationships
ALTER TABLE public.college_data ALTER COLUMN created_by DROP NOT NULL;