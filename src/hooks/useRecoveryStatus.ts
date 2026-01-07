import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MuscleRecoveryData {
  muscleGroup: string;
  lastTrainedAt: Date | null;
  hoursAgo: number;
  intensity: 'light' | 'moderate' | 'heavy';
  recoveryPercent: number;
  status: 'recovered' | 'recovering' | 'fatigued';
  recommendation: string;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
}

interface RecoveryStats {
  muscleGroups: MuscleRecoveryData[];
  overallRecovery: number;
  readyToTrain: string[];
  needsRest: string[];
  loading: boolean;
}

// Recovery time in hours based on intensity
const RECOVERY_HOURS = {
  light: 24,
  moderate: 48,
  heavy: 72,
};

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Brust',
  back: 'Rücken',
  shoulders: 'Schultern',
  biceps: 'Bizeps',
  triceps: 'Trizeps',
  legs: 'Beine',
  core: 'Core',
  glutes: 'Gesäß',
  calves: 'Waden',
  forearms: 'Unterarme',
};

export function useRecoveryStatus(): RecoveryStats {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [muscleGroups, setMuscleGroups] = useState<MuscleRecoveryData[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRecoveryData = async () => {
      try {
        // Get sessions from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: sessions, error: sessionsError } = await supabase
          .from('workout_sessions')
          .select(`
            id,
            start_time,
            completed_exercises (
              id,
              machine_id,
              machine_name,
              completed_sets (
                reps,
                weight
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('start_time', sevenDaysAgo.toISOString())
          .order('start_time', { ascending: false });

        if (sessionsError) throw sessionsError;

        // Get machine muscle groups
        const machineIds = new Set<string>();
        sessions?.forEach(session => {
          (session.completed_exercises as any[])?.forEach(ex => {
            if (ex.machine_id) machineIds.add(ex.machine_id);
          });
        });

        const { data: machines } = await supabase
          .from('machines')
          .select('id, muscle_groups')
          .in('id', Array.from(machineIds));

        const machineToMuscles: Record<string, string[]> = {};
        machines?.forEach(m => {
          machineToMuscles[m.id] = m.muscle_groups || [];
        });

        // Aggregate muscle group data
        const muscleData: Record<string, {
          lastTrainedAt: Date;
          totalSets: number;
          totalReps: number;
          totalWeight: number;
          sessions: number;
        }> = {};

        sessions?.forEach(session => {
          const sessionDate = new Date(session.start_time);
          
          (session.completed_exercises as any[])?.forEach(exercise => {
            const muscles = exercise.machine_id 
              ? machineToMuscles[exercise.machine_id] || []
              : inferMuscleGroups(exercise.machine_name);

            const sets = (exercise.completed_sets as any[]) || [];
            const totalSets = sets.length;
            const totalReps = sets.reduce((sum: number, s: any) => sum + (s.reps || 0), 0);
            const totalWeight = sets.reduce((sum: number, s: any) => sum + ((s.reps || 0) * (s.weight || 0)), 0);

            muscles.forEach((muscle: string) => {
              const normalizedMuscle = muscle.toLowerCase();
              if (!muscleData[normalizedMuscle]) {
                muscleData[normalizedMuscle] = {
                  lastTrainedAt: sessionDate,
                  totalSets: 0,
                  totalReps: 0,
                  totalWeight: 0,
                  sessions: 0,
                };
              }

              if (sessionDate > muscleData[normalizedMuscle].lastTrainedAt) {
                muscleData[normalizedMuscle].lastTrainedAt = sessionDate;
              }

              muscleData[normalizedMuscle].totalSets += totalSets;
              muscleData[normalizedMuscle].totalReps += totalReps;
              muscleData[normalizedMuscle].totalWeight += totalWeight;
              muscleData[normalizedMuscle].sessions += 1;
            });
          });
        });

        // Calculate recovery status for each muscle group
        const now = new Date();
        const recoveryData: MuscleRecoveryData[] = Object.entries(muscleData).map(([muscle, data]) => {
          const hoursAgo = (now.getTime() - data.lastTrainedAt.getTime()) / (1000 * 60 * 60);
          
          // Determine intensity based on volume
          let intensity: 'light' | 'moderate' | 'heavy';
          const volumePerSession = data.totalSets / Math.max(data.sessions, 1);
          if (volumePerSession <= 3) {
            intensity = 'light';
          } else if (volumePerSession <= 6) {
            intensity = 'moderate';
          } else {
            intensity = 'heavy';
          }

          const recoveryHours = RECOVERY_HOURS[intensity];
          const recoveryPercent = Math.min(100, Math.round((hoursAgo / recoveryHours) * 100));

          let status: 'recovered' | 'recovering' | 'fatigued';
          let recommendation: string;

          if (recoveryPercent >= 100) {
            status = 'recovered';
            recommendation = 'Bereit für intensives Training';
          } else if (recoveryPercent >= 70) {
            status = 'recovering';
            recommendation = 'Leichtes Training möglich';
          } else {
            status = 'fatigued';
            recommendation = 'Erholung empfohlen';
          }

          return {
            muscleGroup: muscle,
            lastTrainedAt: data.lastTrainedAt,
            hoursAgo: Math.round(hoursAgo),
            intensity,
            recoveryPercent,
            status,
            recommendation,
            totalSets: data.totalSets,
            totalReps: data.totalReps,
            totalWeight: data.totalWeight,
          };
        });

        // Sort by recovery percent (least recovered first)
        recoveryData.sort((a, b) => a.recoveryPercent - b.recoveryPercent);

        setMuscleGroups(recoveryData);
      } catch (error) {
        console.error('Error fetching recovery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecoveryData();
  }, [user]);

  const overallRecovery = muscleGroups.length > 0
    ? Math.round(muscleGroups.reduce((sum, m) => sum + m.recoveryPercent, 0) / muscleGroups.length)
    : 100;

  const readyToTrain = muscleGroups
    .filter(m => m.status === 'recovered')
    .map(m => MUSCLE_GROUP_LABELS[m.muscleGroup] || m.muscleGroup);

  const needsRest = muscleGroups
    .filter(m => m.status === 'fatigued')
    .map(m => MUSCLE_GROUP_LABELS[m.muscleGroup] || m.muscleGroup);

  return {
    muscleGroups,
    overallRecovery,
    readyToTrain,
    needsRest,
    loading,
  };
}

// Helper function to infer muscle groups from exercise name
function inferMuscleGroups(machineName: string): string[] {
  const name = machineName.toLowerCase();
  const groups: string[] = [];

  if (name.includes('chest') || name.includes('bench') || name.includes('brust') || name.includes('fly')) {
    groups.push('chest');
  }
  if (name.includes('back') || name.includes('row') || name.includes('lat') || name.includes('rücken') || name.includes('pull')) {
    groups.push('back');
  }
  if (name.includes('shoulder') || name.includes('press') || name.includes('schulter') || name.includes('delt')) {
    groups.push('shoulders');
  }
  if (name.includes('bicep') || name.includes('curl') || name.includes('bizeps')) {
    groups.push('biceps');
  }
  if (name.includes('tricep') || name.includes('trizeps') || name.includes('extension') || name.includes('dip')) {
    groups.push('triceps');
  }
  if (name.includes('leg') || name.includes('squat') || name.includes('bein') || name.includes('quad') || name.includes('hamstring')) {
    groups.push('legs');
  }
  if (name.includes('core') || name.includes('ab') || name.includes('bauch') || name.includes('crunch')) {
    groups.push('core');
  }
  if (name.includes('glute') || name.includes('hip') || name.includes('gesäß')) {
    groups.push('glutes');
  }
  if (name.includes('calf') || name.includes('wade')) {
    groups.push('calves');
  }

  return groups.length > 0 ? groups : ['other'];
}

export { MUSCLE_GROUP_LABELS };
