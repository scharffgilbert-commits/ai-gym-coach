-- Create workout preferences table
CREATE TABLE public.workout_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  minutes_per_workout INTEGER DEFAULT 60,
  preferred_days TEXT[] DEFAULT '{}',
  intensity TEXT DEFAULT 'moderate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own preferences" 
ON public.workout_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON public.workout_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON public.workout_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_workout_preferences_updated_at
BEFORE UPDATE ON public.workout_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();