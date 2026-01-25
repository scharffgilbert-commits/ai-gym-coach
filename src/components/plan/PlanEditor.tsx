import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  machineName: string;
  sets: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
  order: number;
  isNew?: boolean;
}

interface DayPlan {
  day: string;
  dayIndex: number;
  exercises: Exercise[];
}

interface PlanEditorProps {
  planId: string;
  onBack: () => void;
  onSave: () => void;
}

export function PlanEditor({ planId, onBack, onSave }: PlanEditorProps) {
  const { user } = useAuth();
  const [planName, setPlanName] = useState('');
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();

      if (planError) throw planError;
      if (!plan) throw new Error('Plan not found');

      setPlanName(plan.name);

      const { data: exercises, error: exError } = await supabase
        .from('planned_exercises')
        .select('*')
        .eq('plan_id', planId)
        .order('exercise_order');

      if (exError) throw exError;

      const dayPlans: DayPlan[] = days.map((day, index) => ({
        day,
        dayIndex: index,
        exercises: (exercises || [])
          .filter(ex => ex.day_of_week === index)
          .map(ex => ({
            id: ex.id,
            machineName: ex.machine_name,
            sets: ex.sets,
            targetReps: ex.target_reps,
            targetWeight: ex.target_weight || 0,
            restSeconds: ex.rest_seconds || 60,
            order: ex.exercise_order,
          })),
      }));

      setWeeklyPlan(dayPlans);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  const updateExercise = (dayIndex: number, exerciseId: string, field: keyof Exercise, value: string | number) => {
    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayIndex !== dayIndex) return day;
      return {
        ...day,
        exercises: day.exercises.map(ex => 
          ex.id === exerciseId ? { ...ex, [field]: value } : ex
        ),
      };
    }));
  };

  const addExercise = (dayIndex: number) => {
    const newExercise: Exercise = {
      id: `new-${Date.now()}`,
      machineName: 'New Exercise',
      sets: 3,
      targetReps: 12,
      targetWeight: 0,
      restSeconds: 60,
      order: weeklyPlan[dayIndex].exercises.length,
      isNew: true,
    };

    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayIndex !== dayIndex) return day;
      return { ...day, exercises: [...day.exercises, newExercise] };
    }));
  };

  const removeExercise = (dayIndex: number, exerciseId: string) => {
    setWeeklyPlan(prev => prev.map(day => {
      if (day.dayIndex !== dayIndex) return day;
      return {
        ...day,
        exercises: day.exercises.filter(ex => ex.id !== exerciseId),
      };
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Update plan name
      await supabase
        .from('workout_plans')
        .update({ name: planName, updated_at: new Date().toISOString() })
        .eq('id', planId);

      // Get existing exercise IDs
      const { data: existingExercises } = await supabase
        .from('planned_exercises')
        .select('id')
        .eq('plan_id', planId);

      const existingIds = new Set((existingExercises || []).map(e => e.id));
      const currentIds = new Set<string>();

      // Process each day
      for (const day of weeklyPlan) {
        for (let i = 0; i < day.exercises.length; i++) {
          const ex = day.exercises[i];
          const exerciseData = {
            plan_id: planId,
            machine_name: ex.machineName,
            sets: ex.sets,
            target_reps: ex.targetReps,
            target_weight: ex.targetWeight,
            rest_seconds: ex.restSeconds,
            day_of_week: day.dayIndex,
            exercise_order: i,
          };

          if (ex.isNew || ex.id.startsWith('new-')) {
            // Insert new exercise
            const { data: newEx } = await supabase
              .from('planned_exercises')
              .insert(exerciseData)
              .select()
              .single();
            if (newEx) currentIds.add(newEx.id);
          } else {
            // Update existing exercise
            await supabase
              .from('planned_exercises')
              .update(exerciseData)
              .eq('id', ex.id);
            currentIds.add(ex.id);
          }
        }
      }

      // Delete removed exercises
      const toDelete = [...existingIds].filter(id => !currentIds.has(id));
      if (toDelete.length > 0) {
        await supabase
          .from('planned_exercises')
          .delete()
          .in('id', toDelete);
      }

      toast.success('Plan saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading plan...</div>
      </div>
    );
  }

  const currentDay = weeklyPlan[selectedDay];

  return (
    <div className="min-h-screen pb-24 bg-background">
      <PageHeader
        title="Edit Plan"
        subtitle="Customize your workout schedule"
        showBack
        onBack={onBack}
      />

      <div className="px-4 space-y-6">
        {/* Plan Name */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Plan Name
          </label>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="bg-card"
          />
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {days.map((day, index) => {
            const exerciseCount = weeklyPlan[index]?.exercises.length || 0;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDay === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {day.slice(0, 3)}
                {exerciseCount > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    selectedDay === index 
                      ? 'bg-primary-foreground/20' 
                      : 'bg-muted-foreground/20'
                  }`}>
                    {exerciseCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Exercises for Selected Day */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{days[selectedDay]}</h3>
            <Button variant="outline" size="sm" onClick={() => addExercise(selectedDay)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Exercise
            </Button>
          </div>

          {currentDay?.exercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-muted/50 p-8 text-center"
            >
              <p className="text-muted-foreground">Rest day - no exercises</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => addExercise(selectedDay)}
              >
                Add an exercise
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {currentDay?.exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl bg-card p-4 shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center text-muted-foreground mt-2">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      {/* Exercise Name */}
                      <Input
                        value={exercise.machineName}
                        onChange={(e) => updateExercise(selectedDay, exercise.id, 'machineName', e.target.value)}
                        className="font-medium bg-transparent border-0 p-0 h-auto text-foreground focus-visible:ring-0"
                        placeholder="Exercise name"
                      />

                      {/* Sets, Reps, Weight, Rest */}
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Sets</label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(selectedDay, exercise.id, 'sets', parseInt(e.target.value) || 0)}
                            className="h-9 text-center"
                            min={1}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Reps</label>
                          <Input
                            type="number"
                            value={exercise.targetReps}
                            onChange={(e) => updateExercise(selectedDay, exercise.id, 'targetReps', parseInt(e.target.value) || 0)}
                            className="h-9 text-center"
                            min={1}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Weight</label>
                          <Input
                            type="number"
                            value={exercise.targetWeight}
                            onChange={(e) => updateExercise(selectedDay, exercise.id, 'targetWeight', parseFloat(e.target.value) || 0)}
                            className="h-9 text-center"
                            min={0}
                            step={0.5}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Rest (s)</label>
                          <Input
                            type="number"
                            value={exercise.restSeconds}
                            onChange={(e) => updateExercise(selectedDay, exercise.id, 'restSeconds', parseInt(e.target.value) || 0)}
                            className="h-9 text-center"
                            min={0}
                            step={15}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeExercise(selectedDay, exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
