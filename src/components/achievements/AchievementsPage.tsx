import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { AchievementsList } from '@/components/achievements/AchievementsList';

export function AchievementsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-32 safe-area-bottom bg-background"
    >
      <PageHeader
        title="Achievements"
        subtitle="Deine Erfolge und Meilensteine"
      />

      <div className="px-4">
        <AchievementsList />
      </div>
    </motion.div>
  );
}
