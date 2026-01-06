import { motion } from 'framer-motion';
import { Play, Plus, Flame, TrendingUp, Clock, Dumbbell, Trophy, Apple, Calendar, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { PageHeader } from '@/components/layout/PageHeader';
import { WaterTracker } from '@/components/water/WaterTracker';
import { useApp } from '@/contexts/AppContext';

interface DashboardProps {
  onStartWorkout: () => void;
  onAddEquipment: () => void;
  onViewAchievements?: () => void;
  onViewNutrition?: () => void;
  onViewCalendar?: () => void;
  onViewMeasurements?: () => void;
}

export function Dashboard({ onStartWorkout, onAddEquipment, onViewAchievements, onViewNutrition, onViewCalendar, onViewMeasurements }: DashboardProps) {
  const { user, workoutPlans, gyms } = useApp();

  // Mock data for demo
  const weeklyProgress = 65;
  const todaysPlan = workoutPlans[0]?.exercises.filter((e) => e.dayOfWeek === new Date().getDay()) || [];
  const hasEquipment = gyms.length > 0 && gyms[0].machines.length > 0;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <PageHeader
        title={`Hey, ${user?.name?.split(' ')[0] || 'Champion'}!`}
        subtitle="Ready to crush your workout?"
      />

      <div className="px-4 space-y-6">
        {/* Weekly Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitness-card flex items-center gap-6"
        >
          <ProgressRing progress={weeklyProgress} size={100} strokeWidth={10}>
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">{weeklyProgress}%</span>
              <span className="block text-xs text-muted-foreground">Weekly</span>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">Weekly Progress</h3>
            <p className="text-sm text-muted-foreground">3 of 4 workouts complete</p>
            <div className="mt-3 flex gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${
                    i < 3
                      ? 'bg-success text-success-foreground'
                      : i === 3
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Start Workout CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-6 shadow-glow"
        >
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-foreground/10" />
          <div className="absolute right-4 bottom-0 -mb-6 h-24 w-24 rounded-full bg-foreground/5" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-primary-foreground">Today's Workout</h2>
            {hasEquipment ? (
              <>
                <p className="mt-1 text-primary-foreground/80">
                  {todaysPlan.length > 0
                    ? `${todaysPlan.length} exercises • ~45 min`
                    : 'Rest day - but you can still train!'}
                </p>
                <Button
                  variant="glass"
                  size="lg"
                  className="mt-4"
                  onClick={onStartWorkout}
                >
                  <Play className="h-5 w-5" />
                  Start Workout
                </Button>
              </>
            ) : (
              <>
                <p className="mt-1 text-primary-foreground/80">
                  Add your gym equipment to get AI-generated plans
                </p>
                <Button
                  variant="glass"
                  size="lg"
                  className="mt-4"
                  onClick={onAddEquipment}
                >
                  <Plus className="h-5 w-5" />
                  Add Equipment
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Flame}
            label="Streak"
            value="12"
            subValue="days"
            trend="up"
            trendValue="+5"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            label="This Week"
            value="2,450"
            subValue="kg lifted"
            trend="up"
            trendValue="+12%"
            delay={0.25}
          />
        </div>

        {/* Water Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WaterTracker compact />
        </motion.div>

        {/* Achievements Quick View */}
        {onViewAchievements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="fitness-card cursor-pointer"
            onClick={onViewAchievements}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Achievements</p>
                  <p className="text-sm text-muted-foreground">Sammle Badges und Meilensteine</p>
                </div>
              </div>
              <div className="text-primary">→</div>
            </div>
          </motion.div>
        )}

        {/* Nutrition Quick View */}
        {onViewNutrition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="fitness-card cursor-pointer"
            onClick={onViewNutrition}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <Apple className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Ernährung</p>
                  <p className="text-sm text-muted-foreground">Kalorien & Makros tracken</p>
                </div>
              </div>
              <div className="text-primary">→</div>
            </div>
          </motion.div>
        )}

        {/* Calendar Quick View */}
        {onViewCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="fitness-card cursor-pointer"
            onClick={onViewCalendar}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Workout Kalender</p>
                  <p className="text-sm text-muted-foreground">Streak & Trainingsübersicht</p>
                </div>
              </div>
              <div className="text-primary">→</div>
            </div>
          </motion.div>
        )}

        {/* Measurements Quick View */}
        {onViewMeasurements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="fitness-card cursor-pointer"
            onClick={onViewMeasurements}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <Ruler className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Körpermaße</p>
                  <p className="text-sm text-muted-foreground">Fortschritt über Zeit tracken</p>
                </div>
              </div>
              <div className="text-primary">→</div>
            </div>
          </motion.div>
        )}

        {/* Today's Exercises Preview */}
        {hasEquipment && todaysPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">Today's Exercises</h3>
            <div className="space-y-3">
              {todaysPlan.slice(0, 3).map((exercise, i) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{exercise.machineName}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.targetReps} reps @ {exercise.targetWeight}kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {Math.floor(exercise.restSeconds / 60)}m
                  </div>
                </div>
              ))}
              {todaysPlan.length > 3 && (
                <p className="text-center text-sm text-muted-foreground">
                  +{todaysPlan.length - 3} more exercises
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 gap-4"
        >
          <Button
            variant="outline"
            size="lg"
            className="h-auto flex-col gap-2 py-6"
            onClick={onAddEquipment}
          >
            <Plus className="h-6 w-6 text-primary" />
            <span>Add Machine</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-auto flex-col gap-2 py-6"
            onClick={onStartWorkout}
          >
            <Dumbbell className="h-6 w-6 text-primary" />
            <span>Quick Workout</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
