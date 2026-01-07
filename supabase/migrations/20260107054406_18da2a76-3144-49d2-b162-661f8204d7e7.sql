-- Create gym chains table for fitness chains (e.g., McFit, FitX, etc.)
CREATE TABLE public.gym_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  default_equipment JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_chains ENABLE ROW LEVEL SECURITY;

-- Everyone can view gym chains
CREATE POLICY "Anyone can view gym chains" 
ON public.gym_chains FOR SELECT 
USING (true);

-- Add chain reference to gyms
ALTER TABLE public.gyms 
ADD COLUMN chain_id UUID REFERENCES public.gym_chains(id);

-- Create equipment usage tracking for better AI personalization
CREATE TABLE public.equipment_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 1,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  max_weight NUMERIC DEFAULT 0,
  avg_weight NUMERIC DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  comfort_rating INTEGER CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, machine_id)
);

-- Enable RLS
ALTER TABLE public.equipment_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for equipment usage
CREATE POLICY "Users can view own equipment usage" 
ON public.equipment_usage FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment usage" 
ON public.equipment_usage FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment usage" 
ON public.equipment_usage FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_equipment_usage_updated_at
BEFORE UPDATE ON public.equipment_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add onboarding_equipment_complete flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN equipment_onboarding_complete BOOLEAN DEFAULT false;

-- Insert common gym chains
INSERT INTO public.gym_chains (name, default_equipment) VALUES
('McFit', '["Latzug", "Brustpresse", "Beinpresse", "Rudermaschine", "Schulterpress", "Kabelzug", "Laufband", "Crosstrainer"]'),
('FitX', '["Latzug", "Brustpresse", "Beinpresse", "Butterfly", "Schulterpress", "Kabelzug", "Rudergerät", "Fahrrad"]'),
('Fitness First', '["Latzug", "Brustpresse", "Beinpresse", "Cable Crossover", "Leg Curl", "Leg Extension", "Laufband"]'),
('John Reed', '["Latzug", "Brustpresse", "Beinpresse", "Freihanteln", "Kabelzug", "Rudermaschine", "Laufband"]'),
('clever fit', '["Latzug", "Brustpresse", "Beinpresse", "Butterfly", "Kabelzug", "Crosstrainer", "Laufband"]');