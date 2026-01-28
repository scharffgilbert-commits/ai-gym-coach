import { motion } from 'framer-motion';
import { phaseRecommendations, CyclePhase, PhaseRecommendation } from '@/hooks/useCycleTracking';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { Zap, Moon, Sun, Sunrise } from 'lucide-react';

interface CycleInsightsProps {
  currentPhase: CyclePhase;
}

const phaseIcons: Record<CyclePhase, typeof Zap> = {
  menstruation: Moon,
  follicular: Sunrise,
  ovulation: Sun,
  luteal: Moon,
};

const phaseColors: Record<CyclePhase, string> = {
  menstruation: 'from-rose-500 to-red-600',
  follicular: 'from-emerald-500 to-green-600',
  ovulation: 'from-amber-400 to-yellow-500',
  luteal: 'from-blue-500 to-indigo-600',
};

export function CycleInsights({ currentPhase }: CycleInsightsProps) {
  const { t } = useLanguage();
  const recommendation = phaseRecommendations[currentPhase];
  const Icon = phaseIcons[currentPhase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Current Phase Card */}
      <div className={cn(
        "rounded-2xl p-6 bg-gradient-to-br text-white",
        phaseColors[currentPhase]
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{recommendation.title}</h3>
            <p className="text-white/80">{t('cycle_energy')}: {recommendation.energy}</p>
          </div>
        </div>
        
        <p className="text-white/90">{recommendation.recommendation}</p>
      </div>

      {/* Detailed Recommendations */}
      <div className="grid gap-3">
        <InsightCard
          title={t('cycle_training_tip')}
          content={recommendation.recommendation}
          emoji="💪"
        />
        <InsightCard
          title={t('cycle_avoid')}
          content={recommendation.avoid}
          emoji="⚠️"
        />
        <InsightCard
          title={t('cycle_nutrition_tip')}
          content={recommendation.nutrition}
          emoji="🥗"
        />
      </div>

      {/* All Phases Overview */}
      <div className="fitness-card">
        <h4 className="font-semibold text-foreground mb-3">{t('cycle_phases_overview')}</h4>
        <div className="space-y-2">
          {(Object.entries(phaseRecommendations) as [CyclePhase, PhaseRecommendation][]).map(([phase, rec]) => (
            <div
              key={phase}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-all",
                currentPhase === phase ? "bg-primary/10" : "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full bg-gradient-to-br",
                  phaseColors[phase]
                )} />
                <span className={cn(
                  "text-sm",
                  currentPhase === phase ? "font-semibold text-foreground" : "text-muted-foreground"
                )}>
                  {rec.title}
                </span>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{rec.energy}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({ title, content, emoji }: { title: string; content: string; emoji: string }) {
  return (
    <div className="fitness-card">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-medium text-foreground text-sm">{title}</p>
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
      </div>
    </div>
  );
}
