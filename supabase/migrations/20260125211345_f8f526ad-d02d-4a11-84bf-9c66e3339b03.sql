-- Create training diary entries table for power users
CREATE TABLE public.training_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  energy_level INTEGER,
  sleep_quality INTEGER,
  stress_level INTEGER,
  mood_tags TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create validation trigger function for level checks (1-10 range)
CREATE OR REPLACE FUNCTION public.validate_diary_entry_levels()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.energy_level IS NOT NULL AND (NEW.energy_level < 1 OR NEW.energy_level > 10) THEN
    RAISE EXCEPTION 'energy_level must be between 1 and 10';
  END IF;
  IF NEW.sleep_quality IS NOT NULL AND (NEW.sleep_quality < 1 OR NEW.sleep_quality > 10) THEN
    RAISE EXCEPTION 'sleep_quality must be between 1 and 10';
  END IF;
  IF NEW.stress_level IS NOT NULL AND (NEW.stress_level < 1 OR NEW.stress_level > 10) THEN
    RAISE EXCEPTION 'stress_level must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

-- Create validation trigger
CREATE TRIGGER validate_diary_entry_levels_trigger
BEFORE INSERT OR UPDATE ON public.training_diary_entries
FOR EACH ROW
EXECUTE FUNCTION public.validate_diary_entry_levels();

-- Create updated_at trigger
CREATE TRIGGER update_training_diary_entries_updated_at
BEFORE UPDATE ON public.training_diary_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.training_diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own diary entries"
ON public.training_diary_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries"
ON public.training_diary_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries"
ON public.training_diary_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries"
ON public.training_diary_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_diary_entries_user_date ON public.training_diary_entries(user_id, entry_date DESC);