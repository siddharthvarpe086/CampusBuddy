-- Add document fields to college_data table
ALTER TABLE public.college_data ADD COLUMN file_url TEXT;
ALTER TABLE public.college_data ADD COLUMN file_name TEXT;
ALTER TABLE public.college_data ADD COLUMN file_type TEXT;
ALTER TABLE public.college_data ADD COLUMN parsed_content TEXT;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('college-documents', 'college-documents', false);

-- Create storage policies for college documents
CREATE POLICY "Faculty can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'college-documents');

CREATE POLICY "Faculty can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'college-documents');

CREATE POLICY "Faculty can update documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'college-documents');

CREATE POLICY "Faculty can delete documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'college-documents');