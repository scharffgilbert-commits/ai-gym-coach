import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Check, X, ChevronRight, Timer, Dumbbell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlannedExercise, CompletedSet } from '@/types/fitness';
import { useWorkoutProgress } from '@/hooks/useWorkoutProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { useLanguage } from '@/i18n/LanguageContext';

interface WorkoutSessionProps {
  onComplete: () => void;
  onExit: () => void;
  initialExercises?: PlannedExercise[];
}

// Mock workout data
const mockExercises: PlannedExercise[] = [
  {
    id: '1',
    machineId: 'm1',
    machineName: 'Chest Press Machine',
    order: 1,
    sets: 4,
    targetReps: 12,
    targetWeight: 50,
    restSeconds: 90,
    dayOfWeek: new Date().getDay(),
  },
  {
    id: '2',
    machineId: 'm2',
    machineName: 'Incline Dumbbell Press',
    order: 2,
    sets: 3,
    targetReps: 10,
    targetWeight: 20,
    restSeconds: 90,
    dayOfWeek: new Date().getDay(),
  },
  {
    id: '3',
    machineId: 'm3',
    machineName: 'Cable Fly',
    order: 3,
    sets: 3,
    targetReps: 15,
    targetWeight: 15,
    restSeconds: 60,
    dayOfWeek: new Date().getDay(),
  },
  {
    id: '4',
    machineId: 'm4',
    machineName: 'Tricep Pushdown',
    order: 4,
    sets: 3,
    targetReps: 12,
    targetWeight: 25,
    restSeconds: 60,
    dayOfWeek: new Date().getDay(),
  },
];

type WorkoutPhase = 'exercise' | 'rest' | 'summary';

export function WorkoutSession({ onComplete, onExit, initialExercises }: WorkoutSessionProps) {
  const { gyms } = useApp();
  const { user: authUser } = useAuth();
  const { saveWorkoutSession } = useWorkoutProgress(authUser?.id);
  const { checkWorkoutAchievements } = useAchievements();
  const { t } = useLanguage();
  
  const [exercises] = useState<PlannedExercise[]>(() => {
    // Use provided exercises first
    if (initialExercises && initialExercises.length > 0) {
      return initialExercises;
    }
    // Fall back to gym machines
    if (gyms[0]?.machines.length > 0) {
      return gyms[0].machines.slice(0, 4).map((m, i) => ({
        id: m.id,
        machineId: m.id,
        machineName: m.name,
        order: i + 1,
        sets: 3,
        targetReps: 12,
        targetWeight: 40,
        restSeconds: 90,
        dayOfWeek: new Date().getDay(),
      }));
    }
    // Fall back to mock exercises
    return mockExercises;
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [phase, setPhase] = useState<WorkoutPhase>('exercise');
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, CompletedSet[]>>({});
  const [workoutStartTime] = useState(new Date());
  const [actualReps, setActualReps] = useState(0);
  const [actualWeight, setActualWeight] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const overallProgress = currentExercise && totalExercises > 0
    ? ((currentExerciseIndex * 100) + ((currentSetNumber - 1) / currentExercise.sets * 100)) / totalExercises
    : 0;

  // All hooks MUST be called before any conditional returns
  useEffect(() => {
    if (currentExercise) {
      setActualReps(currentExercise.targetReps);
      setActualWeight(currentExercise.targetWeight);
    }
  }, [currentExercise]);

  // Show loading or empty state if no exercises
  if (!currentExercise || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('workout_no_exercises')}</p>
          <Button variant="outline" className="mt-4" onClick={onExit}>
            {t('workout_go_back')}
          </Button>
        </div>
      </div>
    );
  }

  // Rest timer countdown
  useEffect(() => {
    if (phase !== 'rest' || isTimerPaused || restTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRestComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isTimerPaused, restTimeRemaining]);

  const handleSetComplete = () => {
    const newSet: CompletedSet = {
      setNumber: currentSetNumber,
      reps: actualReps,
      weight: actualWeight,
      completedAt: new Date(),
    };
    
    const exerciseId = currentExercise.id;
    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), newSet],
    }));

    if (currentSetNumber >= currentExercise.sets) {
      // Exercise complete
      if (currentExerciseIndex >= exercises.length - 1) {
        // Workout complete
        setPhase('summary');
      } else {
        // Start rest before next exercise
        setRestTimeRemaining(currentExercise.restSeconds);
        setPhase('rest');
      }
    } else {
      // More sets remaining
      setCurrentSetNumber(currentSetNumber + 1);
      setRestTimeRemaining(currentExercise.restSeconds);
      setPhase('rest');
    }
  };

  const handleRestComplete = () => {
    if (currentSetNumber >= currentExercise.sets) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetNumber(1);
    }
    setPhase('exercise');
  };

  const handleSkipRest = () => {
    handleRestComplete();
  };

  const adjustValue = (type: 'reps' | 'weight', direction: 'up' | 'down') => {
    const step = type === 'weight' ? 2.5 : 1;
    if (type === 'reps') {
      setActualReps(Math.max(1, actualReps + (direction === 'up' ? step : -step)));
    } else {
      setActualWeight(Math.max(0, actualWeight + (direction === 'up' ? step : -step)));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const workoutDuration = Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000);

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted safe-area-top">
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Exercise Phase */}
        {phase === 'exercise' && currentExercise && (
          <motion.div
            key="exercise"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen flex-col px-4 pt-16 pb-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button onClick={onExit} className="text-muted-foreground">
                <X className="h-6 w-6" />
              </button>
              <span className="text-sm font-medium text-muted-foreground">
                {t('workout_exercise_of').replace('{current}', String(currentExerciseIndex + 1)).replace('{total}', String(totalExercises))}
              </span>
              <span className="text-sm text-muted-foreground">{formatTime(workoutDuration)}</span>
            </div>

            {/* Exercise Info */}
            <div className="mt-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary shadow-glow"
              >
                <Dumbbell className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">{currentExercise.machineName}</h2>
              <p className="mt-2 text-muted-foreground">
                {t('workout_set_of').replace('{current}', String(currentSetNumber)).replace('{total}', String(currentExercise.sets))}
              </p>
            </div>

            {/* Set Progress Dots */}
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: currentExercise.sets }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-full transition-all ${
                    i < currentSetNumber - 1
                      ? 'bg-success'
                      : i === currentSetNumber - 1
                      ? 'bg-primary animate-pulse-glow'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Adjustable Values */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              {/* Reps */}
              <div className="fitness-card text-center">
                <p className="text-sm font-medium text-muted-foreground">{t('workout_reps').toUpperCase()}</p>
                <div className="mt-2 flex items-center justify-center gap-4">
                  <button
                    onClick={() => adjustValue('reps', 'down')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-muted/80"
                  >
                    -
                  </button>
                  <span className="text-4xl font-bold text-foreground">{actualReps}</span>
                  <button
                    onClick={() => adjustValue('reps', 'up')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-muted/80"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t('workout_target')}: {currentExercise.targetReps}</p>
              </div>

              {/* Weight */}
              <div className="fitness-card text-center">
                <p className="text-sm font-medium text-muted-foreground">{t('workout_weight').toUpperCase()} (kg)</p>
                <div className="mt-2 flex items-center justify-center gap-4">
                  <button
                    onClick={() => adjustValue('weight', 'down')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-muted/80"
                  >
                    -
                  </button>
                  <span className="text-4xl font-bold text-foreground">{actualWeight}</span>
                  <button
                    onClick={() => adjustValue('weight', 'up')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-muted/80"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t('workout_target')}: {currentExercise.targetWeight}kg</p>
              </div>
            </div>

            {/* Complete Set Button */}
            <div className="mt-auto">
              <Button variant="hero" size="xl" className="w-full" onClick={handleSetComplete}>
                <Check className="h-5 w-5" />
                {t('workout_complete_set')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Rest Phase */}
        {phase === 'rest' && (
          <motion.div
            key="rest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen flex-col items-center justify-center px-4"
          >
            <h2 className="mb-8 text-2xl font-bold text-foreground">{t('workout_rest_time')}</h2>
            
            <ProgressRing
              progress={(restTimeRemaining / currentExercise.restSeconds) * 100}
              size={200}
              strokeWidth={12}
              color="primary"
            >
              <div className="text-center">
                <span className="text-5xl font-bold text-foreground">
                  {formatTime(restTimeRemaining)}
                </span>
              </div>
            </ProgressRing>

            <p className="mt-8 text-center text-muted-foreground">
              {currentSetNumber >= currentExercise.sets ? (
                <>
                  {t('workout_next')}: <span className="font-medium text-foreground">{exercises[currentExerciseIndex + 1]?.machineName}</span>
                </>
              ) : (
                <>
                  {t('workout_set_of').replace('{current}', String(currentSetNumber + 1)).replace('{total}', String(currentExercise.sets))}
                </>
              )}
            </p>

            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
              >
                {isTimerPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                {isTimerPaused ? t('workout_resume') : t('workout_pause')}
              </Button>
              <Button variant="hero" size="lg" onClick={handleSkipRest}>
                <SkipForward className="h-5 w-5" />
                {t('workout_skip_rest')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Summary Phase */}
        {phase === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-success/20"
            >
              <Check className="h-12 w-12 text-success" />
            </motion.div>
            
            <h2 className="mt-8 text-3xl font-bold text-foreground">{t('workout_complete')}</h2>
            <p className="mt-2 text-muted-foreground">{t('workout_great_work')}</p>

            <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-4">
              <div className="fitness-card text-center">
                <Timer className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold text-foreground">{formatTime(workoutDuration)}</p>
                <p className="text-sm text-muted-foreground">{t('workout_duration')}</p>
              </div>
              <div className="fitness-card text-center">
                <Dumbbell className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {Object.values(completedSets).reduce((acc, sets) => acc + sets.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">{t('workout_total_sets')}</p>
              </div>
            </div>

            <div className="mt-8 w-full max-w-sm space-y-4">
              <div className="rounded-2xl bg-card p-4 shadow-card">
                <h4 className="font-medium text-foreground">{t('workout_exercises_completed')}</h4>
                <div className="mt-3 space-y-2">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/20 text-success">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-sm text-foreground">{exercise.machineName}</span>
                      <span className="text-sm text-muted-foreground">{exercise.sets} {t('workout_sets')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 w-full max-w-sm">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full" 
                onClick={async () => {
                  setIsSaving(true);
                  const workoutData = {
                    exercises: exercises.map(ex => ({
                      machineName: ex.machineName,
                      machineId: ex.machineId,
                      sets: (completedSets[ex.id] || []).map(set => ({
                        setNumber: set.setNumber,
                        reps: set.reps,
                        weight: set.weight,
                      })),
                    })),
                    totalDuration: workoutDuration,
                  };
                  await saveWorkoutSession(workoutData);
                  await checkWorkoutAchievements();
                  setIsSaving(false);
                  onComplete();
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('workout_saving')}
                  </>
                ) : (
                  <>
                    {t('workout_finish')}
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
