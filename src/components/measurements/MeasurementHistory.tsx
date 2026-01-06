import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";

interface Measurement {
  id: string;
  measured_at: string;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  left_calf_cm: number | null;
  right_calf_cm: number | null;
  weight_kg: number | null;
  body_fat_percent: number | null;
  notes: string | null;
}

interface MeasurementHistoryProps {
  measurements: Measurement[];
  onDeleted: () => void;
}

function MeasurementCard({
  measurement,
  onDelete,
}: {
  measurement: Measurement;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("body_measurements")
        .delete()
        .eq("id", measurement.id);

      if (error) throw error;
      toast.success("Messung gelöscht");
      onDelete();
    } catch (error) {
      console.error("Error deleting measurement:", error);
      toast.error("Fehler beim Löschen");
    } finally {
      setDeleting(false);
    }
  };

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return "-";
    return `${value}${unit}`;
  };

  const mainValues = [
    { label: "Gewicht", value: measurement.weight_kg, unit: " kg" },
    { label: "Körperfett", value: measurement.body_fat_percent, unit: "%" },
    { label: "Brust", value: measurement.chest_cm, unit: " cm" },
    { label: "Taille", value: measurement.waist_cm, unit: " cm" },
  ].filter((v) => v.value !== null);

  const detailValues = [
    { label: "Hüfte", value: measurement.hips_cm, unit: " cm" },
    { label: "L. Arm", value: measurement.left_arm_cm, unit: " cm" },
    { label: "R. Arm", value: measurement.right_arm_cm, unit: " cm" },
    { label: "L. Oberschenkel", value: measurement.left_thigh_cm, unit: " cm" },
    { label: "R. Oberschenkel", value: measurement.right_thigh_cm, unit: " cm" },
    { label: "L. Wade", value: measurement.left_calf_cm, unit: " cm" },
    { label: "R. Wade", value: measurement.right_calf_cm, unit: " cm" },
  ].filter((v) => v.value !== null);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {format(new Date(measurement.measured_at), "dd. MMMM yyyy", {
            locale: de,
          })}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={deleting}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Messung löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {mainValues.map((v) => (
          <div key={v.label} className="flex justify-between">
            <span className="text-muted-foreground">{v.label}</span>
            <span className="font-medium">{formatValue(v.value, v.unit)}</span>
          </div>
        ))}
      </div>

      {expanded && detailValues.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
          {detailValues.map((v) => (
            <div key={v.label} className="flex justify-between">
              <span className="text-muted-foreground">{v.label}</span>
              <span className="font-medium">{formatValue(v.value, v.unit)}</span>
            </div>
          ))}
        </div>
      )}

      {expanded && measurement.notes && (
        <div className="pt-2 border-t text-sm">
          <span className="text-muted-foreground">Notizen: </span>
          <span>{measurement.notes}</span>
        </div>
      )}
    </div>
  );
}

export function MeasurementHistory({
  measurements,
  onDeleted,
}: MeasurementHistoryProps) {
  if (measurements.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Verlauf</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {measurements.map((m) => (
          <MeasurementCard key={m.id} measurement={m} onDelete={onDeleted} />
        ))}
      </CardContent>
    </Card>
  );
}
