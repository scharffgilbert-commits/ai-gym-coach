import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkAndUnlockAchievement = useCallback(async (achievementKey: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Get the achievement by key
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('key', achievementKey)
        .single();

      if (achievementError || !achievement) return false;

      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievement.id)
        .single();

      if (existing) return false; // Already unlocked

      // Unlock the achievement
      const { error: unlockError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id,
        });

      if (unlockError) {
        console.error('Error unlocking achievement:', unlockError);
        return false;
      }

      // Show toast notification
      toast.success('🏆 Achievement freigeschaltet!', {
        description: `${achievement.name}: ${achievement.description}`,
        duration: 5000,
      });

      return true;
    } catch (error) {
      console.error('Error checking achievement:', error);
      return false;
    }
  }, [user?.id]);

  const checkWorkoutAchievements = useCallback(async () => {
    if (!user?.id) return;
    setIsChecking(true);

    try {
      // Count total workouts
      const { count } = await supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const workoutCount = count || 0;

      // Check workout count achievements
      if (workoutCount >= 1) await checkAndUnlockAchievement('first_workout');
      if (workoutCount >= 5) await checkAndUnlockAchievement('workout_5');
      if (workoutCount >= 10) await checkAndUnlockAchievement('workout_10');
      if (workoutCount >= 25) await checkAndUnlockAchievement('workout_25');
      if (workoutCount >= 50) await checkAndUnlockAchievement('workout_50');
      if (workoutCount >= 100) await checkAndUnlockAchievement('workout_100');

      // Check time-based achievements
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 7) await checkAndUnlockAchievement('early_bird');
      if (hour >= 22) await checkAndUnlockAchievement('night_owl');

      // Check streak achievements
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('start_time')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('start_time', { ascending: false })
        .limit(30);

      if (sessions) {
        let streak = 0;
        let lastDate: Date | null = null;

        for (const session of sessions) {
          const sessionDate = new Date(session.start_time);
          sessionDate.setHours(0, 0, 0, 0);

          if (!lastDate) {
            streak = 1;
            lastDate = sessionDate;
          } else {
            const diff = (lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              streak++;
              lastDate = sessionDate;
            } else if (diff > 1) {
              break;
            }
          }
        }

        if (streak >= 3) await checkAndUnlockAchievement('streak_3');
        if (streak >= 7) await checkAndUnlockAchievement('streak_7');
        if (streak >= 30) await checkAndUnlockAchievement('streak_30');
      }

      // Check total weight lifted
      const { data: sets } = await supabase
        .from('completed_sets')
        .select(`
          weight,
          reps,
          completed_exercises!inner (
            session_id,
            workout_sessions!inner (
              user_id
            )
          )
        `)
        .eq('completed_exercises.workout_sessions.user_id', user.id);

      if (sets) {
        const totalWeight = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
        if (totalWeight >= 1000) await checkAndUnlockAchievement('weight_lifted_1000');
      }

    } catch (error) {
      console.error('Error checking achievements:', error);
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, checkAndUnlockAchievement]);

  const checkWaterAchievements = useCallback(async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayEntries } = await supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_id', user.id)
        .gte('logged_at', today.toISOString());

      if (todayEntries) {
        const totalToday = todayEntries.reduce((sum, e) => sum + e.amount_ml, 0);
        if (totalToday >= 2500) {
          await checkAndUnlockAchievement('water_goal');
        }
      }

      // Check water week achievement
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const { data: weekEntries } = await supabase
        .from('water_intake')
        .select('logged_at, amount_ml')
        .eq('user_id', user.id)
        .gte('logged_at', weekAgo.toISOString());

      if (weekEntries) {
        // Group by day and check if goal was met each day
        const dailyTotals: Record<string, number> = {};
        weekEntries.forEach(entry => {
          const day = new Date(entry.logged_at).toDateString();
          dailyTotals[day] = (dailyTotals[day] || 0) + entry.amount_ml;
        });

        const daysMetGoal = Object.values(dailyTotals).filter(total => total >= 2500).length;
        if (daysMetGoal >= 7) {
          await checkAndUnlockAchievement('water_week');
        }
      }
    } catch (error) {
      console.error('Error checking water achievements:', error);
    }
  }, [user?.id, checkAndUnlockAchievement]);

  return {
    checkAndUnlockAchievement,
    checkWorkoutAchievements,
    checkWaterAchievements,
    isChecking,
  };
}
