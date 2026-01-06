-- Create nutrition_goals table for daily targets
CREATE TABLE public.nutrition_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  daily_protein_g INTEGER NOT NULL DEFAULT 150,
  daily_carbs_g INTEGER NOT NULL DEFAULT 250,
  daily_fat_g INTEGER NOT NULL DEFAULT 65,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nutrition_entries table for food logging
CREATE TABLE public.nutrition_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_type TEXT NOT NULL DEFAULT 'snack',
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  serving_size TEXT,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for nutrition_goals
CREATE POLICY "Users can view own nutrition goals" 
ON public.nutrition_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition goals" 
ON public.nutrition_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition goals" 
ON public.nutrition_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for nutrition_entries
CREATE POLICY "Users can view own nutrition entries" 
ON public.nutrition_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition entries" 
ON public.nutrition_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition entries" 
ON public.nutrition_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition entries" 
ON public.nutrition_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add updated_at trigger for nutrition_goals
CREATE TRIGGER update_nutrition_goals_updated_at
BEFORE UPDATE ON public.nutrition_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();