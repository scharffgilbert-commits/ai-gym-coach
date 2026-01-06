import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Ruler } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddMeasurementProps {
  onMeasurementAdded: () => void;
}

export function AddMeasurement({ onMeasurementAdded }: AddMeasurementProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState({
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    left_arm_cm: "",
    right_arm_cm: "",
    left_thigh_cm: "",
    right_thigh_cm: "",
    left_calf_cm: "",
    right_calf_cm: "",
    weight_kg: "",
    body_fat_percent: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("body_measurements")
        .insert({
          user_id: user.id,
          chest_cm: measurements.chest_cm ? parseFloat(measurements.chest_cm) : null,
          waist_cm: measurements.waist_cm ? parseFloat(measurements.waist_cm) : null,
          hips_cm: measurements.hips_cm ? parseFloat(measurements.hips_cm) : null,
          left_arm_cm: measurements.left_arm_cm ? parseFloat(measurements.left_arm_cm) : null,
          right_arm_cm: measurements.right_arm_cm ? parseFloat(measurements.right_arm_cm) : null,
          left_thigh_cm: measurements.left_thigh_cm ? parseFloat(measurements.left_thigh_cm) : null,
          right_thigh_cm: measurements.right_thigh_cm ? parseFloat(measurements.right_thigh_cm) : null,
          left_calf_cm: measurements.left_calf_cm ? parseFloat(measurements.left_calf_cm) : null,
          right_calf_cm: measurements.right_calf_cm ? parseFloat(measurements.right_calf_cm) : null,
          weight_kg: measurements.weight_kg ? parseFloat(measurements.weight_kg) : null,
          body_fat_percent: measurements.body_fat_percent ? parseFloat(measurements.body_fat_percent) : null,
          notes: measurements.notes || null,
        });

      if (error) throw error;

      toast.success("Messung gespeichert!");
      setMeasurements({
        chest_cm: "",
        waist_cm: "",
        hips_cm: "",
        left_arm_cm: "",
        right_arm_cm: "",
        left_thigh_cm: "",
        right_thigh_cm: "",
        left_calf_cm: "",
        right_calf_cm: "",
        weight_kg: "",
        body_fat_percent: "",
        notes: "",
      });
      setOpen(false);
      onMeasurementAdded();
    } catch (error) {
      console.error("Error saving measurement:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Messung
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Körpermaße erfassen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Gewicht (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                placeholder="75.5"
                value={measurements.weight_kg}
                onChange={(e) => handleChange("weight_kg", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body_fat_percent">Körperfett (%)</Label>
              <Input
                id="body_fat_percent"
                type="number"
                step="0.1"
                placeholder="15"
                value={measurements.body_fat_percent}
                onChange={(e) => handleChange("body_fat_percent", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Oberkörper (cm)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest_cm">Brust</Label>
                <Input
                  id="chest_cm"
                  type="number"
                  step="0.1"
                  placeholder="100"
                  value={measurements.chest_cm}
                  onChange={(e) => handleChange("chest_cm", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waist_cm">Taille</Label>
                <Input
                  id="waist_cm"
                  type="number"
                  step="0.1"
                  placeholder="80"
                  value={measurements.waist_cm}
                  onChange={(e) => handleChange("waist_cm", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hips_cm">Hüfte</Label>
                <Input
                  id="hips_cm"
                  type="number"
                  step="0.1"
                  placeholder="95"
                  value={measurements.hips_cm}
                  onChange={(e) => handleChange("hips_cm", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Arme (cm)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="left_arm_cm">Linker Arm</Label>
                <Input
                  id="left_arm_cm"
                  type="number"
                  step="0.1"
                  placeholder="35"
                  value={measurements.left_arm_cm}
                  onChange={(e) => handleChange("left_arm_cm", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="right_arm_cm">Rechter Arm</Label>
                <Input
                  id="right_arm_cm"
                  type="number"
                  step="0.1"
                  placeholder="35"
                  value={measurements.right_arm_cm}
                  onChange={(e) => handleChange("right_arm_cm", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Beine (cm)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="left_thigh_cm">Linker Oberschenkel</Label>
                <Input
                  id="left_thigh_cm"
                  type="number"
                  step="0.1"
                  placeholder="55"
                  value={measurements.left_thigh_cm}
                  onChange={(e) => handleChange("left_thigh_cm", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="right_thigh_cm">Rechter Oberschenkel</Label>
                <Input
                  id="right_thigh_cm"
                  type="number"
                  step="0.1"
                  placeholder="55"
                  value={measurements.right_thigh_cm}
                  onChange={(e) => handleChange("right_thigh_cm", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="left_calf_cm">Linke Wade</Label>
                <Input
                  id="left_calf_cm"
                  type="number"
                  step="0.1"
                  placeholder="38"
                  value={measurements.left_calf_cm}
                  onChange={(e) => handleChange("left_calf_cm", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="right_calf_cm">Rechte Wade</Label>
                <Input
                  id="right_calf_cm"
                  type="number"
                  step="0.1"
                  placeholder="38"
                  value={measurements.right_calf_cm}
                  onChange={(e) => handleChange("right_calf_cm", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Optionale Notizen..."
              value={measurements.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Speichern..." : "Messung speichern"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
