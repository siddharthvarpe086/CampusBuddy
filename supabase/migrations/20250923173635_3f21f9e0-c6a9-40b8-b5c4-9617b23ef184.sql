-- Create SyncSpot questions table
CREATE TABLE public.syncspot_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SyncSpot answers table
CREATE TABLE public.syncspot_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.syncspot_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.syncspot_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncspot_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for syncspot_questions
CREATE POLICY "Everyone can view questions" 
ON public.syncspot_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create questions" 
ON public.syncspot_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" 
ON public.syncspot_questions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for syncspot_answers
CREATE POLICY "Everyone can view answers" 
ON public.syncspot_answers 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create answers" 
ON public.syncspot_answers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own answers" 
ON public.syncspot_answers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_syncspot_questions_updated_at
BEFORE UPDATE ON public.syncspot_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_syncspot_answers_updated_at
BEFORE UPDATE ON public.syncspot_answers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();