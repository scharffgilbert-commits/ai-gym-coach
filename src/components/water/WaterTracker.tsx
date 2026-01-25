import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Plus, Minus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

interface WaterEntry {
  id: string;
  amount_ml: number;
  logged_at: string;
}

interface WaterTrackerProps {
  compact?: boolean;
}

export function WaterTracker({ compact = false }: WaterTrackerProps) {
  const { user } = useAuth();
  const { checkWaterAchievements } = useAchievements();
  const { t } = useLanguage();
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(250);
  
  const dailyGoal = 2500; // ml
  const totalToday = entries.reduce((sum, e) => sum + e.amount_ml, 0);
  const progress = Math.min((totalToday / dailyGoal) * 100, 100);

  const quickAmounts = [150, 250, 500, 750];

  useEffect(() => {
    if (user?.id) {
      fetchTodayEntries();
    }
  }, [user?.id]);

  const fetchTodayEntries = async () => {
    if (!user?.id) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', today.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching water entries:', error);
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  const addWater = async (amount: number) => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('water_intake')
      .insert({
        user_id: user.id,
        amount_ml: amount,
      })
      .select()
      .single();

    if (error) {
      toast.error(t('error_saving'));
      return;
    }

    setEntries([data, ...entries]);
    
    const newTotal = totalToday + amount;
    if (newTotal >= dailyGoal && totalToday < dailyGoal) {
      toast.success(`🎉 ${t('water_goal_reached')}`, {
        description: t('water_goal_description'),
      });
      checkWaterAchievements();
    } else {
      toast.success(`+${amount}ml ${t('water_added')}`);
    }
  };

  const removeEntry = async (id: string) => {
    const { error } = await supabase
      .from('water_intake')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(t('error_deleting'));
      return;
    }

    setEntries(entries.filter(e => e.id !== id));
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fitness-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <Droplet className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('water_today')}</p>
              <p className="text-xl font-bold text-foreground">
                {(totalToday / 1000).toFixed(1)}L <span className="text-sm font-normal text-muted-foreground">/ {dailyGoal / 1000}L</span>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => addWater(250)}
            className="rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-blue-500"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Progress Circle */}
      <div className="flex flex-col items-center">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(199 89% 48%)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="text-center">
            <Droplet className="mx-auto h-8 w-8 text-blue-500" />
            <p className="mt-1 text-3xl font-bold text-foreground">{totalToday}</p>
            <p className="text-sm text-muted-foreground">von {dailyGoal} ml</p>
          </div>
        </div>
        
        {progress >= 100 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 flex items-center gap-2 rounded-full bg-success/20 px-4 py-2"
          >
            <Target className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">{t('water_goal_reached')}</span>
          </motion.div>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {quickAmounts.map((amount) => (
          <Button
            key={amount}
            variant={selectedAmount === amount ? 'default' : 'outline'}
            onClick={() => setSelectedAmount(amount)}
            className="flex-col py-3"
          >
            <span className="text-lg font-bold">{amount}</span>
            <span className="text-xs">ml</span>
          </Button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedAmount(Math.max(50, selectedAmount - 50))}
          className="rounded-full"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">{selectedAmount}</p>
          <p className="text-sm text-muted-foreground">ml</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedAmount(selectedAmount + 50)}
          className="rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={() => addWater(selectedAmount)}
      >
        <Droplet className="mr-2 h-5 w-5" />
        {selectedAmount}ml {t('water_add_button')}
      </Button>

      {/* Today's Entries */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{t('water_drunk_today')}</h4>
          <AnimatePresence>
            {entries.slice(0, 5).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between rounded-xl bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-foreground">{entry.amount_ml} ml</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.logged_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
