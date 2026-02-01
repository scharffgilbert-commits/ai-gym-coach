import { motion } from 'framer-motion';
import { TrendingUp, Flame, Dumbbell, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutProgress } from '@/hooks/useWorkoutProgress';

export function ProgressDashboard() {
  const { user } = useAuth();
  const { stats, isLoading } = useWorkoutProgress(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-32 safe-area-bottom bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const weeklyData = stats.weeklyData;
  const muscleProgress = stats.muscleProgress.length > 0 
    ? stats.muscleProgress 
    : [
        { name: 'Chest', progress: 0, workouts: 0 },
        { name: 'Back', progress: 0, workouts: 0 },
        { name: 'Legs', progress: 0, workouts: 0 },
        { name: 'Shoulders', progress: 0, workouts: 0 },
        { name: 'Arms', progress: 0, workouts: 0 },
        { name: 'Core', progress: 0, workouts: 0 },
      ];

  return (
    <div className="min-h-screen pb-32 safe-area-bottom bg-background">
      <PageHeader
        title="Progress"
        subtitle="Track your fitness journey"
      />

      <div className="px-4 space-y-6">
        {/* Weekly Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitness-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">This Week</h3>
              <p className="text-sm text-muted-foreground">
                {stats.weeklyCompleted} of {stats.weeklyGoal} workouts
              </p>
            </div>
            <ProgressRing
              progress={(stats.weeklyCompleted / stats.weeklyGoal) * 100}
              size={80}
              strokeWidth={8}
              showPercentage
            />
          </div>
          
          <div className="mt-6 flex justify-between">
            {weeklyData.map((day, i) => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <div className="relative h-20 w-3 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${day.value}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="absolute bottom-0 w-full rounded-full gradient-primary"
                  />
                </div>
                <span className={`text-xs font-medium ${
                  i === new Date().getDay() - 1 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={stats.currentStreak}
            subValue="days"
            trend="up"
            trendValue="+5"
            delay={0.1}
          />
          <StatCard
            icon={Calendar}
            label="Total Workouts"
            value={stats.totalWorkouts}
            subValue="sessions"
            delay={0.15}
          />
          <StatCard
            icon={Dumbbell}
            label="Weight Lifted"
            value={`${(stats.totalWeightLifted / 1000).toFixed(1)}t`}
            subValue="total"
            trend="up"
            trendValue="+8%"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Duration"
            value={stats.averageDuration}
            subValue="minutes"
            delay={0.25}
          />
        </div>

        {/* Muscle Group Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Muscle Progress</h3>
            <button className="flex items-center gap-1 text-sm text-primary">
              View all
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {muscleProgress.map((muscle, i) => (
              <motion.div
                key={muscle.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="rounded-2xl bg-card p-4 shadow-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{muscle.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {muscle.workouts} workouts
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${muscle.progress}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }}
                    className="absolute inset-y-0 left-0 rounded-full gradient-primary"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {muscle.progress}% of monthly goal
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Personal Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">Personal Records</h3>
          {stats.personalRecords.length > 0 ? (
            <div className="space-y-3">
              {stats.personalRecords.map((pr, i) => (
                <motion.div
                  key={pr.exercise}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 text-warning">
                    🏆
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{pr.exercise}</p>
                    <p className="text-sm text-muted-foreground">{pr.date}</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">{pr.record}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-6 shadow-card text-center">
              <p className="text-muted-foreground">Complete workouts to set personal records!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
