import { format } from 'date-fns';
import { Locale } from 'date-fns';
import { 
  Battery, 
  Moon, 
  Brain, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/i18n/LanguageContext';
import { DiaryEntry } from './TrainingDiary';
import type { LucideIcon } from 'lucide-react';

interface MoodTag {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  moodTags: MoodTag[];
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  dateLocale: Locale;
}

export function DiaryEntryCard({ entry, moodTags, onEdit, onDelete, dateLocale }: DiaryEntryCardProps) {
  const { t } = useLanguage();

  const getLevelColor = (value: number | null, type: 'energy' | 'sleep' | 'stress') => {
    if (value === null) return 'text-muted-foreground';
    if (type === 'stress') {
      if (value <= 3) return 'text-green-500';
      if (value <= 6) return 'text-yellow-500';
      return 'text-red-500';
    }
    if (value <= 3) return 'text-red-500';
    if (value <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const matchingTags = moodTags.filter(tag => entry.mood_tags?.includes(tag.id));

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Date Sidebar */}
          <div className="w-16 bg-muted/50 flex flex-col items-center justify-center p-3 border-r">
            <span className="text-2xl font-bold">
              {format(new Date(entry.entry_date), 'dd')}
            </span>
            <span className="text-xs text-muted-foreground uppercase">
              {format(new Date(entry.entry_date), 'MMM', { locale: dateLocale })}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(entry.entry_date), 'EEEE', { locale: dateLocale })}
                </span>
              </div>
              
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(entry)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('diary_deleteConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('diary_deleteConfirmDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(entry.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Wellbeing Stats */}
            <div className="flex gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Battery className={`h-4 w-4 ${getLevelColor(entry.energy_level, 'energy')}`} />
                <span className={`text-sm font-medium ${getLevelColor(entry.energy_level, 'energy')}`}>
                  {entry.energy_level ?? '-'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Moon className={`h-4 w-4 ${getLevelColor(entry.sleep_quality, 'sleep')}`} />
                <span className={`text-sm font-medium ${getLevelColor(entry.sleep_quality, 'sleep')}`}>
                  {entry.sleep_quality ?? '-'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className={`h-4 w-4 ${getLevelColor(entry.stress_level, 'stress')}`} />
                <span className={`text-sm font-medium ${getLevelColor(entry.stress_level, 'stress')}`}>
                  {entry.stress_level ?? '-'}
                </span>
              </div>
            </div>

            {/* Mood Tags */}
            {matchingTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {matchingTags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    <tag.icon className="h-3 w-3 mr-1" />
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Notes */}
            {entry.notes && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
