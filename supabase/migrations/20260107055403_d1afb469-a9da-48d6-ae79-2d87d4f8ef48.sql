-- Create table for storing synced health data
CREATE TABLE public.health_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data_type TEXT NOT NULL, -- 'steps', 'heart_rate', 'calories', 'sleep', 'workout'
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- 'steps', 'bpm', 'kcal', 'minutes', etc.
  source TEXT NOT NULL, -- 'apple_health', 'google_fit', 'manual'
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own health data"
  ON public.health_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
  ON public.health_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health data"
  ON public.health_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_health_data_user_type_date ON public.health_data (user_id, data_type, recorded_at DESC);