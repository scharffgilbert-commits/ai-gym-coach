import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlannedExercise, WorkoutPlan } from '@/types/fitness';
import { toast } from 'sonner';

interface GeneratedPlan {
  planName: string;
  weeklyPlan: Record<string, {
    machineName: string;
    sets: number;
    targetReps: number;
    targetWeight: number;
    restSeconds: number;
  }[]>;
  tips: string[];
}

export interface WorkoutPreferences {
  minutesPerWorkout: number;
  workoutsPerWeek: number;
  preferredDays: string[];
  intensity: 'light' | 'moderate' | 'intense';
}

interface EquipmentUsageData {
  machineName: string;
  usageCount: number;
  totalSets: number;
  totalReps: number;
  maxWeight: number;
  avgWeight: number;
  comfortRating?: number;
  lastUsed?: string;
}

export function useWorkoutGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const { fitnessGoals, gyms, healthProfile, setWorkoutPlans, workoutPlans } = useApp();
  const { user } = useAuth();

  const fetchEquipmentUsage = async (): Promise<EquipmentUsageData[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('equipment_usage')
        .select(`
          *,
          machines:machine_id (
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      return (data || []).map(usage => ({
        machineName: (usage.machines as any)?.name || 'Unknown',
        usageCount: usage.usage_count || 0,
        totalSets: usage.total_sets || 0,
        totalReps: usage.total_reps || 0,
        maxWeight: Number(usage.max_weight) || 0,
        avgWeight: Number(usage.avg_weight) || 0,
        comfortRating: usage.comfort_rating || undefined,
        lastUsed: usage.last_used_at || undefined,
      }));
    } catch (error) {
      console.error('Error fetching equipment usage:', error);
      return [];
    }
  };

  const generateWorkout = async (preferences?: WorkoutPreferences) => {
    setIsGenerating(true);

    try {
      // Fetch equipment usage data for personalization
      const equipmentUsage = await fetchEquipmentUsage();

      const equipment = gyms.flatMap(gym => 
        gym.machines.map(m => ({
          name: m.name,
          category: m.category,
          muscleGroups: m.muscleGroups,
        }))
      );

      const goals = {
        experienceLevel: fitnessGoals?.experienceLevel || 'beginner',
        focusAreas: fitnessGoals?.focusAreas || ['full-body'],
        goalTypes: [
          ...(fitnessGoals?.shortTerm?.map(g => g.type) || []),
          ...(fitnessGoals?.midTerm?.map(g => g.type) || []),
          ...(fitnessGoals?.longTerm?.map(g => g.type) || []),
        ].filter((v, i, a) => a.indexOf(v) === i) || ['sustainable-fitness'],
      };

      const healthData = healthProfile ? {
        age: healthProfile.age,
        gender: healthProfile.gender,
        injuries: healthProfile.injuries.map(i => ({
          area: i.area,
          severity: i.severity,
        })),
      } : undefined;

      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: { 
          goals, 
          equipment, 
          healthProfile: healthData, 
          preferences,
          equipmentUsage: equipmentUsage.length > 0 ? equipmentUsage : undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedPlan(data);

      // Convert to WorkoutPlan format and add to state
      const newPlan: WorkoutPlan = {
        id: crypto.randomUUID(),
        userId: 'current-user',
        name: data.planName,
        description: 'AI-generated personalized workout plan',
        weeklySchedule: {
          monday: (data.weeklyPlan.Monday?.length || 0) > 0,
          tuesday: (data.weeklyPlan.Tuesday?.length || 0) > 0,
          wednesday: (data.weeklyPlan.Wednesday?.length || 0) > 0,
          thursday: (data.weeklyPlan.Thursday?.length || 0) > 0,
          friday: (data.weeklyPlan.Friday?.length || 0) > 0,
          saturday: (data.weeklyPlan.Saturday?.length || 0) > 0,
          sunday: (data.weeklyPlan.Sunday?.length || 0) > 0,
        },
        createdAt: new Date(),
        aiGenerated: true,
        exercises: Object.entries(data.weeklyPlan).flatMap(([day, exercises], dayIndex) =>
          (exercises as any[]).map((ex, i): PlannedExercise => ({
            id: crypto.randomUUID(),
            machineId: `ai-${dayIndex}-${i}`,
            machineName: ex.machineName,
            order: i + 1,
            sets: ex.sets,
            targetReps: ex.targetReps,
            targetWeight: ex.targetWeight,
            restSeconds: ex.restSeconds,
            dayOfWeek: dayIndex,
          }))
        ),
      };

      setWorkoutPlans([newPlan, ...workoutPlans]);
      toast.success('Workout plan generated!', {
        description: data.tips?.[0] || 'Your personalized plan is ready.',
      });

      return data;
    } catch (error) {
      console.error('Error generating workout:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate workout';
      toast.error('Generation failed', { description: message });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWorkout,
    isGenerating,
    generatedPlan,
  };
}
