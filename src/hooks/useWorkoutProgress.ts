import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProgressStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalWeightLifted: number;
  averageDuration: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  weeklyData: { day: string; value: number }[];
  muscleProgress: { name: string; progress: number; workouts: number }[];
  personalRecords: { exercise: string; record: string; date: string }[];
}

interface WorkoutSessionData {
  planId?: string;
  exercises: {
    machineName: string;
    machineId?: string;
    sets: {
      setNumber: number;
      reps: number;
      weight: number;
      rpe?: number;
    }[];
  }[];
  totalDuration: number;
  caloriesBurned?: number;
}

export function useWorkoutProgress(userId?: string) {
  const [stats, setStats] = useState<ProgressStats>({
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWeightLifted: 0,
    averageDuration: 0,
    weeklyGoal: 4,
    weeklyCompleted: 0,
    weeklyData: [
      { day: 'Mon', value: 0 },
      { day: 'Tue', value: 0 },
      { day: 'Wed', value: 0 },
      { day: 'Thu', value: 0 },
      { day: 'Fri', value: 0 },
      { day: 'Sat', value: 0 },
      { day: 'Sun', value: 0 },
    ],
    muscleProgress: [],
    personalRecords: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch workout sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('end_time', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch completed exercises with sets
      const { data: exercises, error: exercisesError } = await supabase
        .from('completed_exercises')
        .select(`
          *,
          completed_sets (*)
        `)
        .in('session_id', sessions?.map(s => s.id) || []);

      if (exercisesError) throw exercisesError;

      // Calculate stats
      const totalWorkouts = sessions?.length || 0;
      const totalDuration = sessions?.reduce((acc, s) => acc + (s.total_duration || 0), 0) || 0;
      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0;

      // Calculate total weight lifted
      let totalWeightLifted = 0;
      const machineStats: Record<string, { weight: number; count: number }> = {};
      
      exercises?.forEach(ex => {
        const sets = ex.completed_sets || [];
        sets.forEach((set: any) => {
          const volume = set.weight * set.reps;
          totalWeightLifted += volume;
          
          if (!machineStats[ex.machine_name]) {
            machineStats[ex.machine_name] = { weight: 0, count: 0 };
          }
          machineStats[ex.machine_name].weight = Math.max(machineStats[ex.machine_name].weight, set.weight);
          machineStats[ex.machine_name].count += 1;
        });
      });

      // Calculate streak
      const sortedDates = sessions
        ?.map(s => new Date(s.end_time || s.start_time).toDateString())
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) || [];

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        for (let i = 0; i < sortedDates.length; i++) {
          const expectedDate = new Date(Date.now() - i * 86400000).toDateString();
          if (sortedDates.includes(expectedDate)) {
            tempStreak++;
          } else {
            break;
          }
        }
        currentStreak = tempStreak;
      }

      // Calculate longest streak (simplified)
      longestStreak = Math.max(currentStreak, sortedDates.length > 0 ? 1 : 0);

      // Calculate weekly data
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const dayStr = dayDate.toDateString();
        
        const dayWorkouts = sessions?.filter(s => {
          const sessionDate = new Date(s.end_time || s.start_time).toDateString();
          return sessionDate === dayStr;
        }) || [];

        return {
          day,
          value: dayWorkouts.length > 0 ? 100 : 0,
        };
      });

      const weeklyCompleted = weeklyData.filter(d => d.value > 0).length;

      // Personal records
      const personalRecords = Object.entries(machineStats)
        .map(([exercise, data]) => ({
          exercise,
          record: `${data.weight}kg`,
          date: 'Recent',
        }))
        .slice(0, 5);

      // Muscle progress (simplified based on exercise count)
      const muscleCategories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
      const muscleProgress = muscleCategories.map(name => {
        const workouts = Object.keys(machineStats).filter(m => 
          m.toLowerCase().includes(name.toLowerCase())
        ).length;
        return {
          name,
          progress: Math.min(100, workouts * 15),
          workouts,
        };
      });

      setStats({
        totalWorkouts,
        currentStreak,
        longestStreak,
        totalWeightLifted,
        averageDuration,
        weeklyGoal: 4,
        weeklyCompleted,
        weeklyData,
        muscleProgress,
        personalRecords,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const saveWorkoutSession = async (data: WorkoutSessionData): Promise<boolean> => {
    if (!userId) {
      toast.error('Please sign in to save your workout');
      return false;
    }

    try {
      // Create workout session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          plan_id: data.planId || null,
          status: 'completed',
          end_time: new Date().toISOString(),
          total_duration: data.totalDuration,
          calories_burned: data.caloriesBurned,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save completed exercises
      for (const exercise of data.exercises) {
        const { data: completedExercise, error: exerciseError } = await supabase
          .from('completed_exercises')
          .insert({
            session_id: session.id,
            machine_name: exercise.machineName,
            machine_id: exercise.machineId || null,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Save completed sets
        const setsToInsert = exercise.sets.map(set => ({
          exercise_id: completedExercise.id,
          set_number: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe || null,
        }));

        const { error: setsError } = await supabase
          .from('completed_sets')
          .insert(setsToInsert);

        if (setsError) throw setsError;
      }

      toast.success('Workout saved!', {
        description: 'Your progress has been recorded.',
      });

      // Refresh stats
      await fetchProgress();
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout', {
        description: 'Please try again.',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    stats,
    isLoading,
    saveWorkoutSession,
    refreshProgress: fetchProgress,
  };
}
