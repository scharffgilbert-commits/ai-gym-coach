import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, Locale } from 'date-fns';
import { de, enUS, es, fr, it, pt } from 'date-fns/locale';
import { Calendar, Moon, ChevronLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/layout/PageHeader';
import { CycleTracker } from './CycleTracker';
import { CycleInsights } from './CycleInsights';
import { useCycleTracking } from '@/hooks/useCycleTracking';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface CyclePageProps {
  onBack: () => void;
}

const locales: Record<string, Locale> = {
  de, en: enUS, es, fr, it, pt,
};

export function CyclePage({ onBack }: CyclePageProps) {
  const { cycleData, isLoading, updatePeriodStart, setCycleLength, toggleCycleTracking } = useCycleTracking();
  const { t, language } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date | undefined>();
  const [pendingLength, setPendingLength] = useState(cycleData.cycleLength);

  const handleSaveSettings = async () => {
    try {
      if (pendingDate) {
        await updatePeriodStart(pendingDate);
      }
      if (pendingLength !== cycleData.cycleLength) {
        await setCycleLength(pendingLength);
      }
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="min-h-screen pb-32 safe-area-bottom bg-background">
      <PageHeader
        title={t('cycle_title')}
        subtitle={t('cycle_subtitle')}
        showBack
        onBack={onBack}
        rightElement={
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fitness-card space-y-4"
          >
            <h3 className="font-semibold text-foreground">{t('cycle_settings')}</h3>
            
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('cycle_enable')}</span>
              <Switch
                checked={cycleData.isEnabled}
                onCheckedChange={toggleCycleTracking}
              />
            </div>

            {cycleData.isEnabled && (
              <>
                {/* Last Period Start */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {t('cycle_last_period')}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {pendingDate || cycleData.lastPeriodStart
                          ? format(pendingDate || cycleData.lastPeriodStart!, 'PPP', { locale: locales[language] || enUS })
                          : t('cycle_select_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={pendingDate || cycleData.lastPeriodStart || undefined}
                        onSelect={setPendingDate}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Cycle Length */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">
                      {t('cycle_length')}
                    </label>
                    <span className="text-sm font-medium text-foreground">{pendingLength} {t('dashboard_days')}</span>
                  </div>
                  <Slider
                    value={[pendingLength]}
                    onValueChange={([value]) => setPendingLength(value)}
                    min={21}
                    max={35}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  {t('save')}
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Main Content */}
        {cycleData.isEnabled && cycleData.lastPeriodStart ? (
          <>
            <CycleTracker />
            <CycleInsights currentPhase={cycleData.currentPhase} />

            {/* Next Period Prediction */}
            {cycleData.nextPeriod && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fitness-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('cycle_next_period')}</p>
                    <p className="font-semibold text-foreground">
                      {format(cycleData.nextPeriod, 'PPP', { locale: locales[language] || enUS })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fitness-card text-center py-8"
          >
            <Moon className="w-16 h-16 mx-auto text-primary/50 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">{t('cycle_not_configured')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('cycle_setup_hint')}</p>
            <Button onClick={() => setShowSettings(true)}>
              {t('cycle_setup')}
            </Button>
          </motion.div>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-center text-muted-foreground px-4">
          {t('cycle_privacy_note')}
        </p>
      </div>
    </div>
  );
}
