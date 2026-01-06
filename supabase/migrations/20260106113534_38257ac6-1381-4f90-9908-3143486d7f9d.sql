-- Water intake tracking table
CREATE TABLE public.water_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL DEFAULT 250,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own water intake" ON public.water_intake
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake" ON public.water_intake
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water intake" ON public.water_intake
  FOR DELETE USING (auth.uid() = user_id);

-- Achievements definition table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'general',
  threshold INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements (unlocked)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements are public (read-only definitions)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- Insert default achievements
INSERT INTO public.achievements (key, name, description, icon, category, threshold) VALUES
  ('first_workout', 'Erster Schritt', 'Absolviere dein erstes Workout', 'footprints', 'workout', 1),
  ('workout_5', 'Auf dem Weg', '5 Workouts absolviert', 'trending-up', 'workout', 5),
  ('workout_10', 'Durchhalter', '10 Workouts absolviert', 'flame', 'workout', 10),
  ('workout_25', 'Fitness-Enthusiast', '25 Workouts absolviert', 'star', 'workout', 25),
  ('workout_50', 'Gym-Veteran', '50 Workouts absolviert', 'medal', 'workout', 50),
  ('workout_100', 'Legende', '100 Workouts absolviert', 'crown', 'workout', 100),
  ('streak_3', 'Drei-Tage-Streak', '3 Tage in Folge trainiert', 'zap', 'streak', 3),
  ('streak_7', 'Wochenkrieger', '7 Tage in Folge trainiert', 'calendar-check', 'streak', 7),
  ('streak_30', 'Monatsmeister', '30 Tage in Folge trainiert', 'trophy', 'streak', 30),
  ('water_goal', 'Hydration Hero', 'Tägliches Wasserziel erreicht', 'droplet', 'water', 1),
  ('water_week', 'Wasser-Woche', '7 Tage Wasserziel erreicht', 'droplets', 'water', 7),
  ('first_pr', 'Persönlicher Rekord', 'Ersten PR aufgestellt', 'award', 'strength', 1),
  ('weight_lifted_1000', 'Tonnen-Club', '1000kg insgesamt gehoben', 'dumbbell', 'strength', 1000),
  ('early_bird', 'Frühaufsteher', 'Workout vor 7 Uhr morgens', 'sunrise', 'special', 1),
  ('night_owl', 'Nachteule', 'Workout nach 22 Uhr', 'moon', 'special', 1);