import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Utensils, ScanBarcode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BarcodeScanner } from "./BarcodeScanner";

interface AddFoodEntryProps {
  onEntryAdded: () => void;
}

const mealTypes = [
  { value: 'breakfast', label: 'Frühstück', icon: '🌅' },
  { value: 'lunch', label: 'Mittagessen', icon: '☀️' },
  { value: 'dinner', label: 'Abendessen', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

const quickFoods = [
  { name: 'Hähnchenbrust (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Reis (100g gekocht)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Ei (1 Stück)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Haferflocken (50g)', calories: 189, protein: 6.5, carbs: 33, fat: 3.5 },
  { name: 'Banane (1 Stück)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Griechischer Joghurt (150g)', calories: 146, protein: 13, carbs: 6, fat: 8 },
  { name: 'Mandeln (30g)', calories: 173, protein: 6, carbs: 6, fat: 15 },
  { name: 'Lachs (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
];

export function AddFoodEntry({ onEntryAdded }: AddFoodEntryProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState('snack');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleProductFound = (product: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => {
    setFoodName(product.name);
    setCalories(product.calories.toString());
    setProtein(product.protein.toString());
    setCarbs(product.carbs.toString());
    setFat(product.fat.toString());
    setOpen(true);
  };

  const resetForm = () => {
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setMealType('snack');
  };

  const handleQuickAdd = async (food: typeof quickFoods[0]) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('nutrition_entries')
        .insert({
          user_id: user.id,
          meal_type: mealType,
          food_name: food.name,
          calories: food.calories,
          protein_g: food.protein,
          carbs_g: food.carbs,
          fat_g: food.fat,
        });

      if (error) throw error;
      
      toast.success(`${food.name} hinzugefügt`);
      onEntryAdded();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Fehler beim Hinzufügen');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !foodName) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nutrition_entries')
        .insert({
          user_id: user.id,
          meal_type: mealType,
          food_name: foodName,
          calories: parseInt(calories) || 0,
          protein_g: parseFloat(protein) || 0,
          carbs_g: parseFloat(carbs) || 0,
          fat_g: parseFloat(fat) || 0,
        });

      if (error) throw error;

      toast.success('Eintrag hinzugefügt');
      resetForm();
      setOpen(false);
      onEntryAdded();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Fehler beim Hinzufügen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BarcodeScanner 
        open={scannerOpen} 
        onOpenChange={setScannerOpen}
        onProductFound={handleProductFound}
      />
      
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 flex-1">
              <Plus className="h-4 w-4" />
              Essen hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Mahlzeit erfassen
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Mahlzeit</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal.value} value={meal.value}>
                        {meal.icon} {meal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">Schnellauswahl</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {quickFoods.map((food) => (
                    <Button
                      key={food.name}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 justify-start"
                      onClick={() => handleQuickAdd(food)}
                      disabled={loading}
                    >
                      <span className="truncate">{food.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    oder manuell eingeben
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="foodName">Lebensmittel</Label>
                  <Input
                    id="foodName"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="z.B. Hühnerbrust"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="calories">Kalorien</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Kohlenhydrate (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fett (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !foodName}>
                  {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setScannerOpen(true)}
          title="Barcode scannen"
        >
          <ScanBarcode className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
