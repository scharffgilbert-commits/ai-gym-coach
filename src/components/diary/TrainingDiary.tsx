import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { 
  BookOpen, 
  Plus, 
  Calendar,
  Battery,
  Moon,
  Brain,
  ChevronLeft,
  ChevronRight,
  Filter,
  Smile,
  Frown,
  Meh,
  Zap,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { DiaryEntryForm } from './DiaryEntryForm';
import { DiaryEntryCard } from './DiaryEntryCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export interface DiaryEntry {
  id: string;
  user_id: string;
  session_id: string | null;
  entry_date: string;
  notes: string | null;
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  mood_tags: string[];
  photos: string[];
  created_at: string;
  updated_at: string;
}

interface TrainingDiaryProps {
  onBack?: () => void;
}

export function TrainingDiary({ onBack }: TrainingDiaryProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const dateLocale = language === 'de' ? de : enUS;

  const moodTags = [
    { id: 'motivated', label: t('diary_moodMotivated'), icon: Zap },
    { id: 'tired', label: t('diary_moodTired'), icon: Coffee },
    { id: 'strong', label: t('diary_moodStrong'), icon: Smile },
    { id: 'weak', label: t('diary_moodWeak'), icon: Frown },
    { id: 'neutral', label: t('diary_moodNeutral'), icon: Meh },
  ];

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user, dateRange]);

  const loadEntries = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', format(dateRange.start, 'yyyy-MM-dd'))
        .lte('entry_date', format(dateRange.end, 'yyyy-MM-dd'))
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading diary entries:', error);
      toast({
        title: t('error'),
        description: t('diary_loadError'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = async (entry: Partial<DiaryEntry>) => {
    if (!user) return;

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('training_diary_entries')
          .update({
            notes: entry.notes,
            energy_level: entry.energy_level,
            sleep_quality: entry.sleep_quality,
            stress_level: entry.stress_level,
            mood_tags: entry.mood_tags,
            entry_date: entry.entry_date
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast({ title: t('diary_entryUpdated') });
      } else {
        const { error } = await supabase
          .from('training_diary_entries')
          .insert({
            user_id: user.id,
            notes: entry.notes,
            energy_level: entry.energy_level,
            sleep_quality: entry.sleep_quality,
            stress_level: entry.stress_level,
            mood_tags: entry.mood_tags || [],
            entry_date: entry.entry_date || format(new Date(), 'yyyy-MM-dd'),
            photos: []
          });

        if (error) throw error;
        toast({ title: t('diary_entryCreated') });
      }

      setShowForm(false);
      setEditingEntry(null);
      loadEntries();
    } catch (error) {
      console.error('Error saving diary entry:', error);
      toast({
        title: t('error'),
        description: t('diary_saveError'),
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('training_diary_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t('diary_entryDeleted') });
      loadEntries();
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      toast({
        title: t('error'),
        description: t('diary_deleteError'),
        variant: 'destructive'
      });
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const shiftDateRange = (days: number) => {
    setDateRange(prev => ({
      start: subDays(prev.start, -days),
      end: subDays(prev.end, -days)
    }));
  };

  const filteredEntries = selectedTags.length > 0
    ? entries.filter(e => e.mood_tags?.some(tag => selectedTags.includes(tag)))
    : entries;

  // Calculate averages for the period
  const averages = {
    energy: entries.filter(e => e.energy_level).reduce((sum, e) => sum + (e.energy_level || 0), 0) / (entries.filter(e => e.energy_level).length || 1),
    sleep: entries.filter(e => e.sleep_quality).reduce((sum, e) => sum + (e.sleep_quality || 0), 0) / (entries.filter(e => e.sleep_quality).length || 1),
    stress: entries.filter(e => e.stress_level).reduce((sum, e) => sum + (e.stress_level || 0), 0) / (entries.filter(e => e.stress_level).length || 1),
  };

  if (showForm) {
    return (
      <DiaryEntryForm
        entry={editingEntry}
        onSave={handleSaveEntry}
        onCancel={() => {
          setShowForm(false);
          setEditingEntry(null);
        }}
        moodTags={moodTags}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background pb-24"
    >
      <PageHeader
        title={t('diary_title')}
        subtitle={t('diary_subtitle')}
        showBack={!!onBack}
        onBack={onBack}
        rightElement={
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('diary_newEntry')}
          </Button>
        }
      />

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Date Range Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => shiftDateRange(-7)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(dateRange.start, 'dd. MMM', { locale: dateLocale })} - {format(dateRange.end, 'dd. MMM yyyy', { locale: dateLocale })}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => shiftDateRange(7)}
                disabled={dateRange.end >= new Date()}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardContent className="p-4 text-center">
                <Battery className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <div className="text-2xl font-bold text-yellow-500">{averages.energy.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{t('diary_avgEnergy')}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <CardContent className="p-4 text-center">
                <Moon className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <div className="text-2xl font-bold text-blue-500">{averages.sleep.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{t('diary_avgSleep')}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <Brain className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <div className="text-2xl font-bold text-purple-500">{averages.stress.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{t('diary_avgStress')}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tag Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {moodTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag.id)
                        ? prev.filter(t => t !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                >
                  <tag.icon className="h-3 w-3 mr-1" />
                  {tag.label}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-xs"
                >
                  {t('clear_filter')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entries Timeline */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t('diary_noEntries')}</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                {t('diary_createFirst')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DiaryEntryCard
                  entry={entry}
                  moodTags={moodTags}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                  dateLocale={dateLocale}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
