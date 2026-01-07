import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Footprints, 
  Flame, 
  Moon, 
  RefreshCw, 
  Plus,
  Watch,
  Smartphone,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/PageHeader';
import { useHealthData, HealthDataPoint } from '@/hooks/useHealthData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const HEALTH_METRICS = [
  { 
    key: 'steps' as const, 
    label: 'Schritte', 
    icon: Footprints, 
    unit: 'Schritte',
    color: 'from-blue-500 to-cyan-500',
    goal: 10000,
  },
  { 
    key: 'heart_rate' as const, 
    label: 'Herzfrequenz', 
    icon: Heart, 
    unit: 'bpm',
    color: 'from-rose-500 to-red-500',
    goal: null,
  },
  { 
    key: 'calories' as const, 
    label: 'Kalorien', 
    icon: Flame, 
    unit: 'kcal',
    color: 'from-orange-500 to-amber-500',
    goal: 500,
  },
  { 
    key: 'sleep' as const, 
    label: 'Schlaf', 
    icon: Moon, 
    unit: 'min',
    color: 'from-indigo-500 to-purple-500',
    goal: 480, // 8 hours
  },
];

export function HealthDataPage() {
  const {
    healthStats,
    loading,
    syncing,
    isNativeApp,
    fetchTodaysStats,
    syncFromWearable,
    addManualEntry,
  } = useHealthData();

  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<HealthDataPoint['dataType']>('steps');
  const [manualValue, setManualValue] = useState('');

  useEffect(() => {
    fetchTodaysStats();
  }, [fetchTodaysStats]);

  const handleSync = async () => {
    const result = await syncFromWearable();
    if (result.success) {
      toast.success('Daten erfolgreich synchronisiert');
    } else {
      toast.info(result.message);
    }
  };

  const handleManualSubmit = async () => {
    const value = parseFloat(manualValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Bitte gib einen gültigen Wert ein');
      return;
    }

    const metric = HEALTH_METRICS.find(m => m.key === selectedMetric);
    await addManualEntry(selectedMetric, value, metric?.unit || '');
    
    toast.success('Daten erfolgreich gespeichert');
    setManualDialogOpen(false);
    setManualValue('');
  };

  const formatValue = (key: string, value: number) => {
    if (key === 'sleep') {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      return `${hours}h ${mins}m`;
    }
    return value.toLocaleString('de-DE');
  };

  const getProgress = (key: string, value: number) => {
    const metric = HEALTH_METRICS.find(m => m.key === key);
    if (!metric?.goal) return null;
    return Math.min(100, Math.round((value / metric.goal) * 100));
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <PageHeader
        title="Health Daten"
        subtitle="Wearable & Fitness Tracking"
      />

      <div className="px-4 space-y-6">
        {/* Sync Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitness-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Watch className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Wearable Sync</h3>
                <p className="text-sm text-muted-foreground">
                  {healthStats.lastSynced 
                    ? `Zuletzt: ${healthStats.lastSynced.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Noch nicht synchronisiert'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>

          {!isNativeApp && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 text-sm">
              <Smartphone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Für automatische Wearable-Synchronisation installiere die App auf deinem Gerät. 
                Du kannst Daten auch manuell eingeben.
              </p>
            </div>
          )}
        </motion.div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {HEALTH_METRICS.map((metric, index) => {
            const Icon = metric.icon;
            const value = metric.key === 'steps' ? healthStats.steps
              : metric.key === 'heart_rate' ? healthStats.heartRate
              : metric.key === 'calories' ? healthStats.caloriesBurned
              : healthStats.sleepMinutes;
            const progress = getProgress(metric.key, value);

            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="fitness-card relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-gradient-to-br ${metric.color} opacity-20`} />
                
                <div className="relative">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${metric.color} shadow-lg mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatValue(metric.key, value)}
                  </p>
                  
                  {progress !== null && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, delay: 0.2 * index }}
                          className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {progress}% des Ziels
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fitness-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Heute Zusammenfassung</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(healthStats.steps * 0.0008).toLocaleString('de-DE')}
              </p>
              <p className="text-xs text-muted-foreground">km gelaufen</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {healthStats.caloriesBurned}
              </p>
              <p className="text-xs text-muted-foreground">kcal verbrannt</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(healthStats.sleepMinutes / 60 * 10) / 10}h
              </p>
              <p className="text-xs text-muted-foreground">geschlafen</p>
            </div>
          </div>
        </motion.div>

        {/* Manual Entry Button */}
        <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2" size="lg">
              <Plus className="h-5 w-5" />
              Daten manuell eingeben
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manuelle Dateneingabe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Datentyp</Label>
                <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as HealthDataPoint['dataType'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEALTH_METRICS.map(metric => (
                      <SelectItem key={metric.key} value={metric.key}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Wert ({HEALTH_METRICS.find(m => m.key === selectedMetric)?.unit})</Label>
                <Input
                  type="number"
                  placeholder="Wert eingeben"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                />
              </div>
              
              <Button className="w-full" onClick={handleManualSubmit}>
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
