import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subMonths, addMonths, startOfWeek, endOfWeek, parseISO, isSameMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Flame, Dumbbell, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WorkoutDay {
  date: Date;
  hasWorkout: boolean;
  duration?: number;
  exerciseCount?: number;
}

interface StreakInfo {
  current: number;
  longest: number;
  thisMonth: number;
}

export function WorkoutCalendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({ current: 0, longest: 0, thisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStreaks = useCallback((dates: Date[]) => {
    if (dates.length === 0) {
      setStreakInfo({ current: 0, longest: 0, thisMonth: 0 });
      return;
    }

    // Sort dates descending
    const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
    
    // Get unique dates only (one workout per day max)
    const uniqueDates = sortedDates.filter((date, index, self) =>
      index === self.findIndex((d) => isSameDay(d, date))
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      if (uniqueDates.some(d => isSameDay(d, checkDate))) {
        currentStreak++;
      } else if (i === 0) {
        // If today has no workout, check yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (uniqueDates.some(d => isSameDay(d, yesterday))) {
          // Continue counting from yesterday
          for (let j = 1; j <= uniqueDates.length; j++) {
            const streakDate = new Date(today);
            streakDate.setDate(streakDate.getDate() - j);
            if (uniqueDates.some(d => isSameDay(d, streakDate))) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
        break;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = Math.abs(uniqueDates[i - 1].getTime() - uniqueDates[i].getTime());
      const dayDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Calculate this month's workouts
    const thisMonth = uniqueDates.filter(d => isSameMonth(d, new Date())).length;

    setStreakInfo({ current: currentStreak, longest: longestStreak, thisMonth });
  }, []);

  const fetchWorkoutData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch all workout sessions for the user
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('id, start_time, total_duration, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Get exercises count for each session
      const sessionsWithExercises = await Promise.all(
        (sessions || []).map(async (session) => {
          const { count } = await supabase
            .from('completed_exercises')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);
          
          return {
            ...session,
            exerciseCount: count || 0,
          };
        })
      );

      // Map sessions to workout days
      const days: WorkoutDay[] = sessionsWithExercises.map((session) => ({
        date: parseISO(session.start_time),
        hasWorkout: true,
        duration: session.total_duration || undefined,
        exerciseCount: session.exerciseCount,
      }));

      setWorkoutDays(days);
      calculateStreaks(sessions?.map(s => parseISO(s.start_time)) || []);
    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateStreaks]);

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
    }
  }, [user, currentMonth, fetchWorkoutData]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getWorkoutForDay = (day: Date) => {
    return workoutDays.find(w => isSameDay(w.date, day));
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitness-card text-center"
        >
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{streakInfo.current}</p>
          <p className="text-xs text-muted-foreground">Aktuelle Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="fitness-card text-center"
        >
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{streakInfo.longest}</p>
          <p className="text-xs text-muted-foreground">Beste Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fitness-card text-center"
        >
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{streakInfo.thisMonth}</p>
          <p className="text-xs text-muted-foreground">Diesen Monat</p>
        </motion.div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fitness-card"
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-semibold text-foreground">
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const workout = getWorkoutForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay.date);

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => workout && setSelectedDay(workout)}
                className={`
                  relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                  ${!isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground'}
                  ${isTodayDate ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                  ${workout && !isSelected ? 'bg-success/20 text-success hover:bg-success/30' : 'hover:bg-muted/50'}
                `}
              >
                {format(day, 'd')}
                {workout && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Day Details */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitness-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">
              {format(selectedDay.date, 'EEEE, d. MMMM', { locale: de })}
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {selectedDay.duration && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dauer</p>
                  <p className="font-semibold text-foreground">{selectedDay.duration} Min</p>
                </div>
              </div>
            )}
            
            {selectedDay.exerciseCount !== undefined && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Übungen</p>
                  <p className="font-semibold text-foreground">{selectedDay.exerciseCount}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
