import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Sparkles, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlannedExercise } from '@/types/fitness';

interface PlanSelectorProps {
  onSelectPlan: (exercises: PlannedExercise[]) => void;
  onBack: () => void;
}

interface SavedPlan {
  id: string;
  name: string;
  description: string | null;
  aiGenerated: boolean;
  exercises: PlannedExercise[];
  weeklySchedule: Record<string, boolean>;
}

export function PlanSelector({ onSelectPlan, onBack }: PlanSelectorProps) {
  const { gyms } = useApp();
  const { user: authUser } = useAuth();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const today = new Date().getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today];

  useEffect(() => {
    const fetchPlans = async () => {
      if (!authUser?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch workout plans
        const { data: plansData, error: plansError } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (plansError) throw plansError;

        // Fetch exercises for each plan
        const plansWithExercises: SavedPlan[] = await Promise.all(
          (plansData || []).map(async (plan) => {
            const { data: exercisesData } = await supabase
              .from('planned_exercises')
              .select('*')
              .eq('plan_id', plan.id)
              .order('exercise_order', { ascending: true });

            const exercises: PlannedExercise[] = (exercisesData || []).map(ex => ({
              id: ex.id,
              machineId: ex.machine_id || '',
              machineName: ex.machine_name,
              order: ex.exercise_order,
              sets: ex.sets,
              targetReps: ex.target_reps,
              targetWeight: ex.target_weight || 0,
              restSeconds: ex.rest_seconds || 60,
              dayOfWeek: ex.day_of_week || 0,
              notes: ex.notes || undefined,
            }));

            return {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              aiGenerated: plan.ai_generated || false,
              exercises,
              weeklySchedule: (plan.weekly_schedule as Record<string, boolean>) || {},
            };
          })
        );

        setPlans(plansWithExercises);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [authUser?.id]);

  const handleStartWithPlan = (plan: SavedPlan) => {
    // Get today's exercises from the plan, or all if none scheduled for today
    const todayExercises = plan.exercises.filter(ex => ex.dayOfWeek === today);
    const exercisesToUse = todayExercises.length > 0 ? todayExercises : plan.exercises;
    onSelectPlan(exercisesToUse);
  };

  const handleQuickWorkout = () => {
    // Use gym machines for a quick workout
    const quickExercises: PlannedExercise[] = gyms[0]?.machines.slice(0, 4).map((m, i) => ({
      id: m.id,
      machineId: m.id,
      machineName: m.name,
      order: i + 1,
      sets: 3,
      targetReps: 12,
      targetWeight: 40,
      restSeconds: 90,
      dayOfWeek: today,
    })) || [];
    
    onSelectPlan(quickExercises);
  };

  const getTodayExerciseCount = (plan: SavedPlan): number => {
    return plan.exercises.filter(ex => ex.dayOfWeek === today).length;
  };

  const isScheduledForToday = (plan: SavedPlan): boolean => {
    return plan.weeklySchedule[todayName] === true;
  };

  return (
    <div className="min-h-screen pb-32 safe-area-bottom bg-background">
      <PageHeader
        title="Select Workout"
        subtitle="Choose a plan or start a quick workout"
        showBack
        onBack={onBack}
      />

      <div className="px-4 space-y-6">
        {/* Quick Workout Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-6 shadow-glow"
        >
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-foreground/10" />
          <div className="absolute right-4 bottom-0 -mb-6 h-24 w-24 rounded-full bg-foreground/5" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-primary-foreground">Quick Workout</h2>
            <p className="mt-1 text-primary-foreground/80">
              {gyms[0]?.machines.length > 0 
                ? `Train with ${Math.min(4, gyms[0].machines.length)} of your machines`
                : 'Start with default exercises'}
            </p>
            <Button
              variant="glass"
              size="lg"
              className="mt-4"
              onClick={handleQuickWorkout}
            >
              <Play className="h-5 w-5" />
              Start Now
            </Button>
          </div>
        </motion.div>

        {/* Saved Plans */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Your Plans</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card p-6 text-center shadow-card"
            >
              <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No saved workout plans yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate an AI plan from the Plan tab.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan, i) => {
                const todayCount = getTodayExerciseCount(plan);
                const isToday = isScheduledForToday(plan);
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl p-4 transition-all cursor-pointer ${
                      selectedPlanId === plan.id
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : 'bg-card shadow-card hover:bg-card/80'
                    }`}
                    onClick={() => setSelectedPlanId(selectedPlanId === plan.id ? null : plan.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          plan.aiGenerated
                            ? 'gradient-primary text-primary-foreground'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {plan.aiGenerated ? (
                          <Sparkles className="h-6 w-6" />
                        ) : (
                          <Dumbbell className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{plan.name}</p>
                          {isToday && (
                            <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {todayCount > 0 ? `${todayCount} for today` : `${plan.exercises.length} total`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ~{Math.round(plan.exercises.length * 5)} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {selectedPlanId === plan.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        {plan.description && (
                          <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(todayCount > 0 
                            ? plan.exercises.filter(ex => ex.dayOfWeek === today)
                            : plan.exercises.slice(0, 4)
                          ).map((exercise) => (
                            <span
                              key={exercise.id}
                              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                            >
                              {exercise.machineName}
                            </span>
                          ))}
                          {plan.exercises.length > 4 && todayCount === 0 && (
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                              +{plan.exercises.length - 4} more
                            </span>
                          )}
                        </div>

                        <Button
                          variant="default"
                          size="lg"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWithPlan(plan);
                          }}
                        >
                          <Play className="h-5 w-5" />
                          Start This Workout
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}