import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NutritionSummary } from "./NutritionSummary";
import { AddFoodEntry } from "./AddFoodEntry";
import { FoodEntryList } from "./FoodEntryList";
import { Button } from "@/components/ui/button";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, subDays, isToday } from "date-fns";
import { de } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NutritionPageProps {
  onBack: () => void;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

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

export function NutritionPage({ onBack }: NutritionPageProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [goals, setGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  });
  const [editedGoals, setEditedGoals] = useState(goals);
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const fetchedGoals = {
          calories: data.daily_calories,
          protein: data.daily_protein_g,
          carbs: data.daily_carbs_g,
          fat: data.daily_fat_g,
        };
        setGoals(fetchedGoals);
        setEditedGoals(fetchedGoals);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  }, [user]);

  const fetchEntries = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveGoals = async () => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('nutrition_goals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('nutrition_goals')
          .update({
            daily_calories: editedGoals.calories,
            daily_protein_g: editedGoals.protein,
            daily_carbs_g: editedGoals.carbs,
            daily_fat_g: editedGoals.fat,
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('nutrition_goals')
          .insert({
            user_id: user.id,
            daily_calories: editedGoals.calories,
            daily_protein_g: editedGoals.protein,
            daily_carbs_g: editedGoals.carbs,
            daily_fat_g: editedGoals.fat,
          });

        if (error) throw error;
      }

      setGoals(editedGoals);
      setGoalsDialogOpen(false);
      toast.success('Ziele gespeichert');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + Number(entry.protein_g),
      carbs: acc.carbs + Number(entry.carbs_g),
      fat: acc.fat + Number(entry.fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title="Ernährung" 
        subtitle="Kalorien & Makros tracken"
        showBack
        onBack={onBack}
        rightElement={
          <Dialog open={goalsDialogOpen} onOpenChange={setGoalsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tagesziele anpassen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalCalories">Kalorien (kcal)</Label>
                  <Input
                    id="goalCalories"
                    type="number"
                    value={editedGoals.calories}
                    onChange={(e) => setEditedGoals({ ...editedGoals, calories: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="goalProtein">Protein (g)</Label>
                  <Input
                    id="goalProtein"
                    type="number"
                    value={editedGoals.protein}
                    onChange={(e) => setEditedGoals({ ...editedGoals, protein: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="goalCarbs">Kohlenhydrate (g)</Label>
                  <Input
                    id="goalCarbs"
                    type="number"
                    value={editedGoals.carbs}
                    onChange={(e) => setEditedGoals({ ...editedGoals, carbs: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="goalFat">Fett (g)</Label>
                  <Input
                    id="goalFat"
                    type="number"
                    value={editedGoals.fat}
                    onChange={(e) => setEditedGoals({ ...editedGoals, fat: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Button onClick={handleSaveGoals} className="w-full">
                  Speichern
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-4 space-y-4">
        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-card rounded-lg p-2">
          <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium">
            {isToday(selectedDate) 
              ? 'Heute' 
              : format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextDay}
            disabled={isToday(selectedDate)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Summary */}
        <NutritionSummary
          calories={totals.calories}
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
          goals={goals}
        />

        {/* Add Food Button */}
        {isToday(selectedDate) && (
          <AddFoodEntry onEntryAdded={fetchEntries} />
        )}

        {/* Food Entries List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Lädt...
          </div>
        ) : (
          <FoodEntryList 
            entries={entries} 
            onEntryDeleted={fetchEntries} 
          />
        )}
      </div>
    </div>
  );
}
