import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Star, BarChart3 } from 'lucide-react';
import { useEquipmentUsage } from '@/hooks/useEquipmentUsage';
import { Progress } from '@/components/ui/progress';

interface EquipmentWithStats {
  machine_id: string;
  usage_count: number;
  total_sets: number;
  total_reps: number;
  max_weight: number;
  avg_weight: number;
  comfort_rating: number | null;
  machines: {
    name: string;
    category: string | null;
    muscle_groups: string[] | null;
  } | null;
}

export function EquipmentStats() {
  const { getMostUsedEquipment } = useEquipmentUsage();
  const [equipment, setEquipment] = useState<EquipmentWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getMostUsedEquipment(5);
        setEquipment(data as EquipmentWithStats[]);
      } catch (error) {
        console.error('Error loading equipment stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fitness-card animate-pulse"
      >
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (equipment.length === 0) {
    return null;
  }

  const maxUsageCount = Math.max(...equipment.map((e) => e.usage_count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="fitness-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Deine Top-Geräte</h3>
      </div>

      <div className="space-y-4">
        {equipment.map((item, index) => (
          <motion.div
            key={item.machine_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground truncate">
                    {item.machines?.name || 'Unbekanntes Gerät'}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {item.usage_count}x benutzt
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {item.max_weight}kg max
                  </span>
                  {item.comfort_rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {item.comfort_rating}/5
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Progress
              value={(item.usage_count / maxUsageCount) * 100}
              className="h-1.5"
            />
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {equipment.reduce((sum, e) => sum + e.total_sets, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Sets</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {equipment.reduce((sum, e) => sum + e.total_reps, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Reps</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {equipment.length > 0 ? Math.max(...equipment.map((e) => e.max_weight)) : 0}kg
            </p>
            <p className="text-xs text-muted-foreground">Max Gewicht</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
