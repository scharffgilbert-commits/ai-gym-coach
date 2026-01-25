-- Add cycle tracking columns to health_profiles
ALTER TABLE public.health_profiles 
ADD COLUMN IF NOT EXISTS cycle_tracking_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_period_start DATE,
ADD COLUMN IF NOT EXISTS average_cycle_length INTEGER DEFAULT 28;

-- Create cycle_logs table for detailed period tracking
CREATE TABLE public.cycle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE,
  symptoms JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.cycle_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own cycle logs"
  ON public.cycle_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle logs"
  ON public.cycle_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle logs"
  ON public.cycle_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle logs"
  ON public.cycle_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for fast retrieval
CREATE INDEX idx_cycle_logs_user_date ON public.cycle_logs(user_id, period_start DESC);