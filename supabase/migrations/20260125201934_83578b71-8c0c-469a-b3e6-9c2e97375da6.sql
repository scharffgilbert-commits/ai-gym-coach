-- Fix: Add DELETE policies for tables that are missing them

-- 1. Add DELETE policy for completed_exercises (through session relationship)
CREATE POLICY "Users can delete own completed exercises" 
ON public.completed_exercises 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = completed_exercises.session_id 
  AND workout_sessions.user_id = auth.uid()
));

-- 2. Add DELETE policy for completed_sets (through exercise/session relationship)
CREATE POLICY "Users can delete own completed sets" 
ON public.completed_sets 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM completed_exercises ce 
  JOIN workout_sessions ws ON ce.session_id = ws.id 
  WHERE ce.id = completed_sets.exercise_id 
  AND ws.user_id = auth.uid()
));

-- 3. Add DELETE policy for workout_sessions
CREATE POLICY "Users can delete own sessions" 
ON public.workout_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Add DELETE policy for health_profiles
CREATE POLICY "Users can delete own health profile" 
ON public.health_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Add DELETE policy for fitness_goals
CREATE POLICY "Users can delete own goals" 
ON public.fitness_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Add DELETE policy for workout_preferences
CREATE POLICY "Users can delete own preferences" 
ON public.workout_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Add DELETE policy for equipment_usage
CREATE POLICY "Users can delete own equipment usage" 
ON public.equipment_usage 
FOR DELETE 
USING (auth.uid() = user_id);

-- 8. Add DELETE policy for nutrition_goals
CREATE POLICY "Users can delete own nutrition goals" 
ON public.nutrition_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- 9. Add DELETE policy for training_history
CREATE POLICY "Users can delete own training history" 
ON public.training_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- 10. Add DELETE policy for user_achievements
CREATE POLICY "Users can delete own achievements" 
ON public.user_achievements 
FOR DELETE 
USING (auth.uid() = user_id);