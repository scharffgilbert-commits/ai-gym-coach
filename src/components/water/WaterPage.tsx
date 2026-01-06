import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { WaterTracker } from '@/components/water/WaterTracker';

export function WaterPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 bg-background"
    >
      <PageHeader
        title="Wasser-Tracker"
        subtitle="Bleib hydriert!"
      />

      <div className="px-4">
        <WaterTracker />
      </div>
    </motion.div>
  );
}
