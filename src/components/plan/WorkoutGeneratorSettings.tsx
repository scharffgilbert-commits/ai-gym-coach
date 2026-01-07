import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Sparkles, Loader2, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface GeneratorSettings {
  minutesPerWorkout: number;
  workoutsPerWeek: number;
  preferredDays: string[];
  intensity: 'light' | 'moderate' | 'intense';
}

interface WorkoutGeneratorSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (settings: GeneratorSettings) => void;
  isGenerating: boolean;
}

const DAYS = [
  { value: 'Monday', label: 'Mo' },
  { value: 'Tuesday', label: 'Di' },
  { value: 'Wednesday', label: 'Mi' },
  { value: 'Thursday', label: 'Do' },
  { value: 'Friday', label: 'Fr' },
  { value: 'Saturday', label: 'Sa' },
  { value: 'Sunday', label: 'So' },
];

export function WorkoutGeneratorSettings({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
}: WorkoutGeneratorSettingsProps) {
  const [minutesPerWorkout, setMinutesPerWorkout] = useState(45);
  const [preferredDays, setPreferredDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'intense'>('moderate');

  const handleGenerate = () => {
    onGenerate({
      minutesPerWorkout,
      workoutsPerWeek: preferredDays.length,
      preferredDays,
      intensity,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            KI-Workout-Einstellungen
          </DialogTitle>
          <DialogDescription>
            Personalisiere deinen Trainingsplan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time per workout */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Zeit pro Training
              </Label>
              <span className="text-sm font-medium text-primary">
                {minutesPerWorkout} Min
              </span>
            </div>
            <Slider
              value={[minutesPerWorkout]}
              onValueChange={([val]) => setMinutesPerWorkout(val)}
              min={20}
              max={90}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>20 Min</span>
              <span>90 Min</span>
            </div>
          </div>

          {/* Preferred days */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Bevorzugte Trainingstage
            </Label>
            <ToggleGroup
              type="multiple"
              value={preferredDays}
              onValueChange={(val) => val.length > 0 && setPreferredDays(val)}
              className="flex flex-wrap gap-2"
            >
              {DAYS.map((day) => (
                <ToggleGroupItem
                  key={day.value}
                  value={day.value}
                  className="w-10 h-10 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              {preferredDays.length} Trainingstage pro Woche ausgewählt
            </p>
          </div>

          {/* Intensity */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Trainingsintensität
            </Label>
            <ToggleGroup
              type="single"
              value={intensity}
              onValueChange={(val) => val && setIntensity(val as typeof intensity)}
              className="grid grid-cols-3 gap-2"
            >
              <ToggleGroupItem
                value="light"
                className="flex flex-col gap-1 h-auto py-3 data-[state=on]:bg-green-500/20 data-[state=on]:text-green-600 data-[state=on]:border-green-500"
              >
                <span className="text-lg">🌱</span>
                <span className="text-xs font-medium">Leicht</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="moderate"
                className="flex flex-col gap-1 h-auto py-3 data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-600 data-[state=on]:border-yellow-500"
              >
                <span className="text-lg">💪</span>
                <span className="text-xs font-medium">Moderat</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="intense"
                className="flex flex-col gap-1 h-auto py-3 data-[state=on]:bg-red-500/20 data-[state=on]:text-red-600 data-[state=on]:border-red-500"
              >
                <span className="text-lg">🔥</span>
                <span className="text-xs font-medium">Intensiv</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Abbrechen
          </Button>
          <Button
            className="flex-1"
            onClick={handleGenerate}
            disabled={isGenerating || preferredDays.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generiere...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Plan generieren
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
