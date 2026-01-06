import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MacroRing } from "./MacroRing";
import { Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  compact?: boolean;
}

export function NutritionSummary({
  calories,
  protein,
  carbs,
  fat,
  goals,
  compact = false
}: NutritionSummaryProps) {
  const caloriePercentage = Math.round((calories / goals.calories) * 100);
  const remaining = goals.calories - calories;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="font-semibold">Heute</span>
            </div>
            <span className={cn(
              "text-2xl font-bold",
              caloriePercentage > 100 ? "text-destructive" : "text-primary"
            )}>
              {calories} kcal
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <MacroRing value={protein} max={goals.protein} label="Protein" color="protein" size="sm" />
            <MacroRing value={carbs} max={goals.carbs} label="Carbs" color="carbs" size="sm" />
            <MacroRing value={fat} max={goals.fat} label="Fett" color="fat" size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Tagesübersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calorie Progress */}
        <div className="text-center space-y-2">
          <div className="relative inline-flex items-center justify-center">
            <svg className="transform -rotate-90" width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={52 * 2 * Math.PI}
                strokeDashoffset={52 * 2 * Math.PI * (1 - Math.min(caloriePercentage, 100) / 100)}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="h-5 w-5 text-primary mb-1" />
              <span className="text-2xl font-bold">{calories}</span>
              <span className="text-xs text-muted-foreground">kcal</span>
            </div>
          </div>
          <div className="text-sm">
            {remaining > 0 ? (
              <span className="text-muted-foreground">
                Noch <span className="text-primary font-semibold">{remaining} kcal</span> verfügbar
              </span>
            ) : (
              <span className="text-destructive font-semibold">
                {Math.abs(remaining)} kcal über dem Ziel
              </span>
            )}
          </div>
        </div>

        {/* Macro Progress */}
        <div className="flex justify-around">
          <MacroRing value={protein} max={goals.protein} label="Protein" color="protein" size="lg" />
          <MacroRing value={carbs} max={goals.carbs} label="Carbs" color="carbs" size="lg" />
          <MacroRing value={fat} max={goals.fat} label="Fett" color="fat" size="lg" />
        </div>

        {/* Macro Details */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div className="space-y-1">
            <div className="h-1 rounded-full bg-blue-500/20">
              <div 
                className="h-1 rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min((protein / goals.protein) * 100, 100)}%` }}
              />
            </div>
            <span>{Math.round(protein)}g / {goals.protein}g</span>
          </div>
          <div className="space-y-1">
            <div className="h-1 rounded-full bg-amber-500/20">
              <div 
                className="h-1 rounded-full bg-amber-500 transition-all"
                style={{ width: `${Math.min((carbs / goals.carbs) * 100, 100)}%` }}
              />
            </div>
            <span>{Math.round(carbs)}g / {goals.carbs}g</span>
          </div>
          <div className="space-y-1">
            <div className="h-1 rounded-full bg-rose-500/20">
              <div 
                className="h-1 rounded-full bg-rose-500 transition-all"
                style={{ width: `${Math.min((fat / goals.fat) * 100, 100)}%` }}
              />
            </div>
            <span>{Math.round(fat)}g / {goals.fat}g</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
