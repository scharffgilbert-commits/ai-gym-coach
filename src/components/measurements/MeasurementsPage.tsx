import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AddMeasurement } from "./AddMeasurement";
import { MeasurementChart } from "./MeasurementChart";
import { MeasurementHistory } from "./MeasurementHistory";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

interface MeasurementsPageProps {
  onBack: () => void;
}

export function MeasurementsPage({ onBack }: MeasurementsPageProps) {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeasurements = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error("Error fetching measurements:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const getProgressIndicator = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Körpermaße"
        showBack
        onBack={onBack}
        rightElement={<AddMeasurement onMeasurementAdded={fetchMeasurements} />}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Current Stats */}
        {latestMeasurement && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gewicht</span>
                  {getProgressIndicator(
                    latestMeasurement.weight_kg,
                    previousMeasurement?.weight_kg ?? null
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {latestMeasurement.weight_kg ?? "-"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">kg</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Körperfett</span>
                  {getProgressIndicator(
                    previousMeasurement?.body_fat_percent ?? null,
                    latestMeasurement.body_fat_percent
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {latestMeasurement.body_fat_percent ?? "-"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">%</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Brust</span>
                  {getProgressIndicator(
                    latestMeasurement.chest_cm,
                    previousMeasurement?.chest_cm ?? null
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {latestMeasurement.chest_cm ?? "-"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">cm</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taille</span>
                  {getProgressIndicator(
                    previousMeasurement?.waist_cm ?? null,
                    latestMeasurement.waist_cm
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {latestMeasurement.waist_cm ?? "-"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">cm</span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart */}
        <MeasurementChart measurements={measurements} />

        {/* History */}
        <MeasurementHistory
          measurements={measurements}
          onDeleted={fetchMeasurements}
        />
      </div>
    </div>
  );
}
