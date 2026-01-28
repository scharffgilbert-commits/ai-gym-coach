import { motion } from 'framer-motion';
import { Sparkles, Play, Clock, Dumbbell, ChevronRight, Loader2, Brain, Pencil, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { useWorkoutGeneration } from '@/hooks/useWorkoutGeneration';
import { useMemo, useState } from 'react';
import { WorkoutGeneratorSettings, GeneratorSettings } from './WorkoutGeneratorSettings';

interface WorkoutPlanPageProps {
  onStartWorkout: () => void;
  onEditPlan?: (planId: string) => void;
}

export function WorkoutPlanPage({ onStartWorkout, onEditPlan }: WorkoutPlanPageProps) {
  const { fitnessGoals, workoutPlans } = useApp();
  const { generateWorkout, isGenerating, generatedPlan } = useWorkoutGeneration();
  const [showSettings, setShowSettings] = useState(false);

  const handleGenerateWithSettings = async (settings: GeneratorSettings) => {
    await generateWorkout(settings);
    setShowSettings(false);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Get current plan ID
  const currentPlanId = useMemo(() => {
    if (workoutPlans.length > 0) {
      const plan = workoutPlans.find(p => p.aiGenerated) || workoutPlans[0];
      return plan.id;
    }
    return null;
  }, [workoutPlans]);

  // Build weekly plan from the most recent AI-generated plan or generated plan
  const weeklyPlan = useMemo(() => {
    const plan: Record<string, { machineName: string; sets: number; targetReps: number; targetWeight: number; restSeconds: number; id: string }[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };

    // Use generatedPlan if available, otherwise use workoutPlans
    if (generatedPlan?.weeklyPlan) {
      Object.entries(generatedPlan.weeklyPlan).forEach(([day, exercises]) => {
        plan[day] = (exercises as any[]).map((ex, i) => ({
          id: `gen-${day}-${i}`,
          ...ex,
        }));
      });
    } else if (workoutPlans.length > 0) {
      const latestPlan = workoutPlans.find(p => p.aiGenerated) || workoutPlans[0];
      latestPlan.exercises.forEach(ex => {
        const dayName = days[ex.dayOfWeek];
        if (dayName && plan[dayName]) {
          plan[dayName].push({
            id: ex.id,
            machineName: ex.machineName,
            sets: ex.sets,
            targetReps: ex.targetReps,
            targetWeight: ex.targetWeight,
            restSeconds: ex.restSeconds,
          });
        }
      });
    }

    return plan;
  }, [generatedPlan, workoutPlans]);

  const hasAnyExercises = Object.values(weeklyPlan).some(day => day.length > 0);

  return (
    <div className="min-h-screen pb-32 safe-area-bottom bg-background">
      <PageHeader
        title="Training Plan"
        subtitle="Your AI-generated weekly schedule"
      />

      <div className="px-4 space-y-6">
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">AI-Optimized Plan</p>
            <p className="text-sm text-muted-foreground">
              Based on your {fitnessGoals?.experienceLevel || 'fitness'} level & goals
            </p>
          </div>
        </motion.div>

        {/* Today's Workout CTA */}
        {weeklyPlan[today]?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-6"
          >
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-foreground/10" />
            <div className="relative z-10">
              <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium text-primary-foreground">
                TODAY
              </span>
              <h3 className="mt-3 text-xl font-bold text-primary-foreground">
                {today}'s Workout
              </h3>
              <div className="mt-2 flex items-center gap-4 text-primary-foreground/80">
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  {weeklyPlan[today].length} exercises
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~45 min
                </span>
              </div>
              <Button variant="glass" size="lg" className="mt-4" onClick={onStartWorkout}>
                <Play className="h-5 w-5" />
                Start Workout
              </Button>
            </div>
          </motion.div>
        )}

        {/* Weekly Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Weekly Schedule</h3>
            {currentPlanId && onEditPlan && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditPlan(currentPlanId)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit Plan
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {days.map((day, i) => {
              const exercises = weeklyPlan[day] || [];
              const isToday = day === today;
              const isRest = exercises.length === 0;

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className={`rounded-2xl p-4 transition-all ${
                    isToday
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-card shadow-card'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        isRest
                          ? 'bg-muted text-muted-foreground'
                          : isToday
                          ? 'gradient-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {isRest ? '😴' : <Dumbbell className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{day}</p>
                        {isToday && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isRest ? 'Rest day' : `${exercises.length} exercises`}
                      </p>
                    </div>
                    {!isRest && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </div>

                  {/* Exercise Preview */}
                  {!isRest && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {exercises.slice(0, 3).map((exercise) => (
                        <span
                          key={exercise.id}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {exercise.machineName}
                        </span>
                      ))}
                      {exercises.length > 3 && (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          +{exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Generate/Regenerate Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {!hasAnyExercises && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center">
              <Brain className="h-12 w-12 mx-auto text-primary mb-3" />
              <h4 className="font-semibold text-foreground mb-2">No Plan Yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your first AI-powered workout plan based on your goals and equipment.
              </p>
            </div>
          )}
          <Button 
            variant={hasAnyExercises ? "outline" : "default"} 
            size="lg" 
            className="w-full"
            onClick={() => setShowSettings(true)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Settings className="h-5 w-5" />
                {hasAnyExercises ? 'Regenerate Plan' : 'Generate AI Plan'}
              </>
            )}
          </Button>
        </motion.div>

        {/* Generator Settings Dialog */}
        <WorkoutGeneratorSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          onGenerate={handleGenerateWithSettings}
          isGenerating={isGenerating}
        />

        {/* AI Tips */}
        {generatedPlan?.tips && generatedPlan.tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl bg-card p-4 shadow-card"
          >
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Coach Tips
            </h4>
            <ul className="space-y-2">
              {generatedPlan.tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
