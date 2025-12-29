-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  address TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'none')),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create health_profiles table
CREATE TABLE public.health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  height NUMERIC, -- in cm
  weight NUMERIC, -- in kg
  injuries JSONB DEFAULT '[]'::jsonb,
  preconditions JSONB DEFAULT '[]'::jsonb,
  gdpr_consent BOOLEAN DEFAULT false,
  health_data_consent BOOLEAN DEFAULT false,
  image_analysis_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create fitness_goals table
CREATE TABLE public.fitness_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  short_term_goals JSONB DEFAULT '[]'::jsonb,
  mid_term_goals JSONB DEFAULT '[]'::jsonb,
  long_term_goals JSONB DEFAULT '[]'::jsonb,
  focus_areas TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create gyms table
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create machines table
CREATE TABLE public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  category TEXT CHECK (category IN ('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'functional', 'free-weights')),
  muscle_groups TEXT[] DEFAULT '{}',
  image_url TEXT,
  ai_detected BOOLEAN DEFAULT false,
  user_confirmed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create workout_plans table
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  weekly_schedule JSONB DEFAULT '{"monday":false,"tuesday":false,"wednesday":false,"thursday":false,"friday":false,"saturday":false,"sunday":false}'::jsonb,
  ai_generated BOOLEAN DEFAULT false,
  ai_tips TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create planned_exercises table
CREATE TABLE public.planned_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE NOT NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  machine_name TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  target_reps INTEGER NOT NULL DEFAULT 12,
  target_weight NUMERIC DEFAULT 0,
  rest_seconds INTEGER DEFAULT 60,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ DEFAULT now() NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  total_duration INTEGER, -- in seconds
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create completed_exercises table
CREATE TABLE public.completed_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
  machine_name TEXT NOT NULL,
  feedback TEXT CHECK (feedback IN ('too-easy', 'optimal', 'too-hard')),
  pain_reported BOOLEAN DEFAULT false,
  pain_location TEXT,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create completed_sets table
CREATE TABLE public.completed_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES public.completed_exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create training_history table for quick stats
CREATE TABLE public.training_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL,
  repetitions INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for health_profiles
CREATE POLICY "Users can view own health profile" ON public.health_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health profile" ON public.health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health profile" ON public.health_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for fitness_goals
CREATE POLICY "Users can view own goals" ON public.fitness_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.fitness_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.fitness_goals FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for gyms
CREATE POLICY "Users can view own gyms" ON public.gyms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gyms" ON public.gyms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gyms" ON public.gyms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gyms" ON public.gyms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for machines
CREATE POLICY "Users can view own machines" ON public.machines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own machines" ON public.machines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own machines" ON public.machines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own machines" ON public.machines FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_plans
CREATE POLICY "Users can view own plans" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.workout_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for planned_exercises (via plan ownership)
CREATE POLICY "Users can view exercises in own plans" ON public.planned_exercises FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert exercises in own plans" ON public.planned_exercises FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can update exercises in own plans" ON public.planned_exercises FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete exercises in own plans" ON public.planned_exercises FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.workout_plans WHERE id = plan_id AND user_id = auth.uid()));

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view own sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for completed_exercises (via session ownership)
CREATE POLICY "Users can view own completed exercises" ON public.completed_exercises FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own completed exercises" ON public.completed_exercises FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()));

-- RLS Policies for completed_sets (via exercise/session ownership)
CREATE POLICY "Users can view own completed sets" ON public.completed_sets FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.completed_exercises ce 
    JOIN public.workout_sessions ws ON ce.session_id = ws.id 
    WHERE ce.id = exercise_id AND ws.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own completed sets" ON public.completed_sets FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.completed_exercises ce 
    JOIN public.workout_sessions ws ON ce.session_id = ws.id 
    WHERE ce.id = exercise_id AND ws.user_id = auth.uid()
  ));

-- RLS Policies for training_history
CREATE POLICY "Users can view own history" ON public.training_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.training_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_profiles_updated_at BEFORE UPDATE ON public.health_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fitness_goals_updated_at BEFORE UPDATE ON public.fitness_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON public.machines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();