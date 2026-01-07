import { motion } from 'framer-motion';
import { Activity, BatteryLow, BatteryMedium, BatteryFull, Clock, Zap, Moon } from 'lucide-react';
import { useRecoveryStatus, MUSCLE_GROUP_LABELS } from '@/hooks/useRecoveryStatus';
import { Badge } from '@/components/ui/badge';

export function RecoveryRecommendations() {
  const { muscleGroups, overallRecovery, readyToTrain, needsRest, loading } = useRecoveryStatus();

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
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (muscleGroups.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fitness-card"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Erholung</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Starte dein erstes Training, um Erholungsempfehlungen zu erhalten.
        </p>
      </motion.div>
    );
  }

  const getBatteryIcon = (percent: number) => {
    if (percent >= 80) return BatteryFull;
    if (percent >= 50) return BatteryMedium;
    return BatteryLow;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recovered':
        return 'bg-success/10 text-success border-success/20';
      case 'recovering':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'fatigued':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-success';
    if (percent >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="fitness-card"
    >
      {/* Header with overall recovery */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Erholung</h3>
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const BatteryIcon = getBatteryIcon(overallRecovery);
            return <BatteryIcon className={`h-5 w-5 ${overallRecovery >= 80 ? 'text-success' : overallRecovery >= 50 ? 'text-warning' : 'text-destructive'}`} />;
          })()}
          <span className="font-bold text-foreground">{overallRecovery}%</span>
        </div>
      </div>

      {/* Quick Recommendations */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {readyToTrain.length > 0 && (
          <div className="p-3 rounded-xl bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-success">Bereit</span>
            </div>
            <p className="text-xs text-foreground/80 line-clamp-2">
              {readyToTrain.slice(0, 3).join(', ')}
              {readyToTrain.length > 3 && ` +${readyToTrain.length - 3}`}
            </p>
          </div>
        )}
        {needsRest.length > 0 && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <Moon className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">Ruhe</span>
            </div>
            <p className="text-xs text-foreground/80 line-clamp-2">
              {needsRest.slice(0, 3).join(', ')}
              {needsRest.length > 3 && ` +${needsRest.length - 3}`}
            </p>
          </div>
        )}
      </div>

      {/* Muscle Group Details */}
      <div className="space-y-3">
        {muscleGroups.slice(0, 5).map((muscle, index) => (
          <motion.div
            key={muscle.muscleGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">
                  {MUSCLE_GROUP_LABELS[muscle.muscleGroup] || muscle.muscleGroup}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 ${getStatusColor(muscle.status)}`}
                >
                  {muscle.status === 'recovered' ? 'Erholt' : muscle.status === 'recovering' ? 'Erholt sich' : 'Erschöpft'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{muscle.hoursAgo}h</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${getProgressColor(muscle.recoveryPercent)}`}
                style={{ width: `${muscle.recoveryPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{muscle.recommendation}</p>
          </motion.div>
        ))}
      </div>

      {muscleGroups.length > 5 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          +{muscleGroups.length - 5} weitere Muskelgruppen
        </p>
      )}
    </motion.div>
  );
}
