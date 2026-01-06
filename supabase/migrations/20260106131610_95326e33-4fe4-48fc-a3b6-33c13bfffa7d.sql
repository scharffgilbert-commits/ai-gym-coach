-- Create body measurements table
CREATE TABLE public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chest_cm NUMERIC NULL,
  waist_cm NUMERIC NULL,
  hips_cm NUMERIC NULL,
  left_arm_cm NUMERIC NULL,
  right_arm_cm NUMERIC NULL,
  left_thigh_cm NUMERIC NULL,
  right_thigh_cm NUMERIC NULL,
  left_calf_cm NUMERIC NULL,
  right_calf_cm NUMERIC NULL,
  weight_kg NUMERIC NULL,
  body_fat_percent NUMERIC NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own measurements" 
ON public.body_measurements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements" 
ON public.body_measurements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements" 
ON public.body_measurements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements" 
ON public.body_measurements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, measured_at DESC);