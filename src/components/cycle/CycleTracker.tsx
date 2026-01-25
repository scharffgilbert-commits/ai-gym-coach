import { motion } from 'framer-motion';
import { useCycleTracking, CyclePhase } from '@/hooks/useCycleTracking';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface CycleTrackerProps {
  compact?: boolean;
  onOpenDetails?: () => void;
}

const phaseColors: Record<CyclePhase, string> = {
  menstruation: 'from-rose-500 to-red-600',
  follicular: 'from-emerald-500 to-green-600',
  ovulation: 'from-amber-400 to-yellow-500',
  luteal: 'from-blue-500 to-indigo-600',
};

const phaseBackgrounds: Record<CyclePhase, string> = {
  menstruation: 'bg-rose-500/20',
  follicular: 'bg-emerald-500/20',
  ovulation: 'bg-amber-500/20',
  luteal: 'bg-blue-500/20',
};

export function CycleTracker({ compact = false, onOpenDetails }: CycleTrackerProps) {
  const { cycleData, phaseRecommendation, isLoading } = useCycleTracking();
  const { t } = useLanguage();

  if (isLoading || !cycleData.isEnabled || !cycleData.lastPeriodStart) {
    return null;
  }

  const { currentDay, cycleLength, currentPhase } = cycleData;
  const progress = (currentDay / cycleLength) * 100;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fitness-card cursor-pointer"
        onClick={onOpenDetails}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
              phaseColors[currentPhase]
            )}>
              <span className="text-white font-bold text-lg">{currentDay}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('cycle_title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('cycle_day')} {currentDay} - {phaseRecommendation.title}
              </p>
            </div>
          </div>
          <div className="text-primary">→</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fitness-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t('cycle_title')}</h3>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          phaseBackgrounds[currentPhase],
          "text-foreground"
        )}>
          {phaseRecommendation.title}
        </span>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            {/* Phase segments */}
            {['menstruation', 'follicular', 'ovulation', 'luteal'].map((phase, i) => {
              const startPercent = [0, 18, 46, 57][i];
              const endPercent = [18, 46, 57, 100][i];
              const isActive = phase === currentPhase;
              return (
                <circle
                  key={phase}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={isActive ? `url(#gradient-${phase})` : 'currentColor'}
                  strokeWidth={isActive ? 10 : 6}
                  strokeDasharray={`${(endPercent - startPercent) * 2.64} 264`}
                  strokeDashoffset={-startPercent * 2.64}
                  className={cn(
                    isActive ? '' : 'text-muted/20',
                    'transition-all duration-500'
                  )}
                />
              );
            })}
            {/* Current day marker */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="6 258"
              strokeDashoffset={-(progress * 2.64)}
              className="drop-shadow-lg"
            />
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gradient-menstruation" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="gradient-follicular" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="gradient-ovulation" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="gradient-luteal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{currentDay}</span>
            <span className="text-xs text-muted-foreground">/ {cycleLength}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">{t('cycle_energy')}</p>
            <p className="font-medium text-foreground capitalize">{phaseRecommendation.energy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('cycle_recommendation')}</p>
            <p className="text-sm text-foreground">{phaseRecommendation.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Phase Legend */}
      <div className="mt-4 flex justify-between text-xs">
        {[
          { phase: 'menstruation', label: '🩸', days: '1-5' },
          { phase: 'follicular', label: '🌱', days: '6-13' },
          { phase: 'ovulation', label: '⭐', days: '14-16' },
          { phase: 'luteal', label: '🌙', days: '17-28' },
        ].map(({ phase, label, days }) => (
          <div
            key={phase}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all",
              currentPhase === phase ? phaseBackgrounds[phase as CyclePhase] : ''
            )}
          >
            <span>{label}</span>
            <span className="text-muted-foreground">{days}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
