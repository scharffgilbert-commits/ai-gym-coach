import { motion } from 'framer-motion';
import { Sparkles, Play, Clock, Dumbbell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { PlannedExercise } from '@/types/fitness';

interface WorkoutPlanPageProps {
  onStartWorkout: () => void;
}

export function WorkoutPlanPage({ onStartWorkout }: WorkoutPlanPageProps) {
  const { gyms, fitnessGoals } = useApp();

  const hasEquipment = gyms.length > 0 && gyms[0].machines.length > 0;

  // Mock AI-generated plan based on equipment
  const weeklyPlan: Record<string, PlannedExercise[]> = {
    Monday: [
      { id: '1', machineId: 'm1', machineName: 'Chest Press Machine', order: 1, sets: 4, targetReps: 12, targetWeight: 50, restSeconds: 90, dayOfWeek: 1 },
      { id: '2', machineId: 'm2', machineName: 'Incline Dumbbell Press', order: 2, sets: 3, targetReps: 10, targetWeight: 20, restSeconds: 90, dayOfWeek: 1 },
      { id: '3', machineId: 'm3', machineName: 'Cable Fly', order: 3, sets: 3, targetReps: 15, targetWeight: 15, restSeconds: 60, dayOfWeek: 1 },
      { id: '4', machineId: 'm4', machineName: 'Tricep Pushdown', order: 4, sets: 3, targetReps: 12, targetWeight: 25, restSeconds: 60, dayOfWeek: 1 },
    ],
    Tuesday: [
      { id: '5', machineId: 'm5', machineName: 'Lat Pulldown', order: 1, sets: 4, targetReps: 12, targetWeight: 55, restSeconds: 90, dayOfWeek: 2 },
      { id: '6', machineId: 'm6', machineName: 'Seated Row', order: 2, sets: 4, targetReps: 12, targetWeight: 50, restSeconds: 90, dayOfWeek: 2 },
      { id: '7', machineId: 'm7', machineName: 'Face Pulls', order: 3, sets: 3, targetReps: 15, targetWeight: 20, restSeconds: 60, dayOfWeek: 2 },
      { id: '8', machineId: 'm8', machineName: 'Bicep Curls', order: 4, sets: 3, targetReps: 12, targetWeight: 12, restSeconds: 60, dayOfWeek: 2 },
    ],
    Wednesday: [],
    Thursday: [
      { id: '9', machineId: 'm9', machineName: 'Leg Press', order: 1, sets: 4, targetReps: 12, targetWeight: 120, restSeconds: 120, dayOfWeek: 4 },
      { id: '10', machineId: 'm10', machineName: 'Leg Extension', order: 2, sets: 3, targetReps: 15, targetWeight: 45, restSeconds: 60, dayOfWeek: 4 },
      { id: '11', machineId: 'm11', machineName: 'Leg Curl', order: 3, sets: 3, targetReps: 15, targetWeight: 40, restSeconds: 60, dayOfWeek: 4 },
      { id: '12', machineId: 'm12', machineName: 'Calf Raises', order: 4, sets: 4, targetReps: 15, targetWeight: 80, restSeconds: 60, dayOfWeek: 4 },
    ],
    Friday: [
      { id: '13', machineId: 'm13', machineName: 'Shoulder Press', order: 1, sets: 4, targetReps: 10, targetWeight: 35, restSeconds: 90, dayOfWeek: 5 },
      { id: '14', machineId: 'm14', machineName: 'Lateral Raises', order: 2, sets: 3, targetReps: 15, targetWeight: 10, restSeconds: 60, dayOfWeek: 5 },
      { id: '15', machineId: 'm15', machineName: 'Rear Delt Fly', order: 3, sets: 3, targetReps: 15, targetWeight: 12, restSeconds: 60, dayOfWeek: 5 },
    ],
    Saturday: [],
    Sunday: [],
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="min-h-screen pb-24 bg-background">
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
          <h3 className="mb-4 text-lg font-semibold text-foreground">Weekly Schedule</h3>
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

        {/* Regenerate Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button variant="outline" size="lg" className="w-full">
            <Sparkles className="h-5 w-5" />
            Regenerate Plan
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
