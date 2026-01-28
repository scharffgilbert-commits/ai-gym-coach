import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Battery, Moon, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/LanguageContext';
import { DiaryEntry } from './TrainingDiary';
import type { LucideIcon } from 'lucide-react';

interface MoodTag {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DiaryEntryFormProps {
  entry: DiaryEntry | null;
  onSave: (entry: Partial<DiaryEntry>) => void;
  onCancel: () => void;
  moodTags: MoodTag[];
}

export function DiaryEntryForm({ entry, onSave, onCancel, moodTags }: DiaryEntryFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    entry_date: entry?.entry_date || format(new Date(), 'yyyy-MM-dd'),
    notes: entry?.notes || '',
    energy_level: entry?.energy_level || 5,
    sleep_quality: entry?.sleep_quality || 5,
    stress_level: entry?.stress_level || 5,
    mood_tags: entry?.mood_tags || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleMoodTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      mood_tags: prev.mood_tags.includes(tagId)
        ? prev.mood_tags.filter(t => t !== tagId)
        : [...prev.mood_tags, tagId]
    }));
  };

  const getLevelColor = (value: number, type: 'energy' | 'sleep' | 'stress') => {
    if (type === 'stress') {
      if (value <= 3) return 'text-green-500';
      if (value <= 6) return 'text-yellow-500';
      return 'text-red-500';
    }
    if (value <= 3) return 'text-red-500';
    if (value <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background pb-24"
    >
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                {entry ? t('diary_editEntry') : t('diary_newEntry')}
              </h1>
            </div>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Date */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="entry_date">{t('diary_date')}</Label>
            <Input
              id="entry_date"
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Wellbeing Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('diary_wellbeing')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Energy Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-yellow-500" />
                  <Label>{t('diary_energyLevel')}</Label>
                </div>
                <span className={`font-bold ${getLevelColor(formData.energy_level, 'energy')}`}>
                  {formData.energy_level}/10
                </span>
              </div>
              <Slider
                value={[formData.energy_level]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, energy_level: value }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('diary_low')}</span>
                <span>{t('diary_high')}</span>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <Label>{t('diary_sleepQuality')}</Label>
                </div>
                <span className={`font-bold ${getLevelColor(formData.sleep_quality, 'sleep')}`}>
                  {formData.sleep_quality}/10
                </span>
              </div>
              <Slider
                value={[formData.sleep_quality]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, sleep_quality: value }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('diary_poor')}</span>
                <span>{t('diary_excellent')}</span>
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <Label>{t('diary_stressLevel')}</Label>
                </div>
                <span className={`font-bold ${getLevelColor(formData.stress_level, 'stress')}`}>
                  {formData.stress_level}/10
                </span>
              </div>
              <Slider
                value={[formData.stress_level]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, stress_level: value }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('diary_relaxed')}</span>
                <span>{t('diary_stressed')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('diary_mood')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {moodTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={formData.mood_tags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-3"
                  onClick={() => toggleMoodTag(tag.id)}
                >
                  <tag.icon className="h-4 w-4 mr-1" />
                  {tag.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('diary_notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={t('diary_notesPlaceholder')}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </form>
    </motion.div>
  );
}
