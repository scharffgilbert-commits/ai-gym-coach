import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { WorkoutCalendar } from './WorkoutCalendar';

interface CalendarPageProps {
  onBack?: () => void;
}

export function CalendarPage({ onBack }: CalendarPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 bg-background"
    >
      <PageHeader
        title="Workout Kalender"
        subtitle="Deine Trainingsübersicht"
        showBack={!!onBack}
        onBack={onBack}
      />

      <div className="px-4">
        <WorkoutCalendar />
      </div>
    </motion.div>
  );
}
