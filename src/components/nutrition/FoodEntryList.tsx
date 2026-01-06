import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface FoodEntry {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

interface FoodEntryListProps {
  entries: FoodEntry[];
  onEntryDeleted: () => void;
}

const mealTypeLabels: Record<string, { label: string; icon: string }> = {
  breakfast: { label: 'Frühstück', icon: '🌅' },
  lunch: { label: 'Mittagessen', icon: '☀️' },
  dinner: { label: 'Abendessen', icon: '🌙' },
  snack: { label: 'Snack', icon: '🍎' },
};

export function FoodEntryList({ entries, onEntryDeleted }: FoodEntryListProps) {
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Eintrag gelöscht');
      onEntryDeleted();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  // Group entries by meal type
  const groupedEntries = entries.reduce((acc, entry) => {
    const mealType = entry.meal_type;
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (entries.length === 0) {
    return (
      <Card className="bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Noch keine Mahlzeiten heute</p>
          <p className="text-sm text-muted-foreground/70">
            Füge deine erste Mahlzeit hinzu
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mealOrder.map((mealType) => {
        const mealEntries = groupedEntries[mealType];
        if (!mealEntries?.length) return null;

        const { label, icon } = mealTypeLabels[mealType] || { label: mealType, icon: '🍽️' };
        const totalCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

        return (
          <Card key={mealType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{icon}</span>
                  {label}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {totalCalories} kcal
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mealEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.food_name}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{entry.calories} kcal</span>
                      <span className="text-blue-500">P: {entry.protein_g}g</span>
                      <span className="text-amber-500">C: {entry.carbs_g}g</span>
                      <span className="text-rose-500">F: {entry.fat_g}g</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
