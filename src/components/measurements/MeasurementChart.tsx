import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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
}

interface MeasurementChartProps {
  measurements: Measurement[];
}

const CHART_COLORS = {
  chest: "hsl(var(--primary))",
  waist: "hsl(var(--accent))",
  hips: "hsl(142, 76%, 36%)",
  leftArm: "hsl(var(--primary))",
  rightArm: "hsl(var(--accent))",
  leftThigh: "hsl(var(--primary))",
  rightThigh: "hsl(var(--accent))",
  leftCalf: "hsl(142, 76%, 36%)",
  rightCalf: "hsl(262, 83%, 58%)",
  weight: "hsl(var(--primary))",
  bodyFat: "hsl(var(--accent))",
};

export function MeasurementChart({ measurements }: MeasurementChartProps) {
  const [activeTab, setActiveTab] = useState("weight");

  const chartData = useMemo(() => {
    return [...measurements]
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map((m) => ({
        date: format(new Date(m.measured_at), "dd.MM", { locale: de }),
        fullDate: format(new Date(m.measured_at), "dd. MMM yyyy", { locale: de }),
        chest: m.chest_cm,
        waist: m.waist_cm,
        hips: m.hips_cm,
        leftArm: m.left_arm_cm,
        rightArm: m.right_arm_cm,
        leftThigh: m.left_thigh_cm,
        rightThigh: m.right_thigh_cm,
        leftCalf: m.left_calf_cm,
        rightCalf: m.right_calf_cm,
        weight: m.weight_kg,
        bodyFat: m.body_fat_percent,
      }));
  }, [measurements]);

  if (measurements.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Noch keine Messungen vorhanden. Füge deine erste Messung hinzu!
        </CardContent>
      </Card>
    );
  }

  const renderChart = (
    lines: { key: string; name: string; color: string }[],
    unit: string
  ) => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          unit={unit}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.fullDate || ""
          }
        />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, strokeWidth: 2 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Fortschritt</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="weight">Gewicht</TabsTrigger>
            <TabsTrigger value="torso">Oberkörper</TabsTrigger>
            <TabsTrigger value="arms">Arme</TabsTrigger>
            <TabsTrigger value="legs">Beine</TabsTrigger>
          </TabsList>

          <TabsContent value="weight">
            {renderChart(
              [
                { key: "weight", name: "Gewicht (kg)", color: CHART_COLORS.weight },
                { key: "bodyFat", name: "Körperfett (%)", color: CHART_COLORS.bodyFat },
              ],
              ""
            )}
          </TabsContent>

          <TabsContent value="torso">
            {renderChart(
              [
                { key: "chest", name: "Brust", color: CHART_COLORS.chest },
                { key: "waist", name: "Taille", color: CHART_COLORS.waist },
                { key: "hips", name: "Hüfte", color: CHART_COLORS.hips },
              ],
              "cm"
            )}
          </TabsContent>

          <TabsContent value="arms">
            {renderChart(
              [
                { key: "leftArm", name: "L. Arm", color: CHART_COLORS.leftArm },
                { key: "rightArm", name: "R. Arm", color: CHART_COLORS.rightArm },
              ],
              "cm"
            )}
          </TabsContent>

          <TabsContent value="legs">
            {renderChart(
              [
                { key: "leftThigh", name: "L. Oberschenkel", color: CHART_COLORS.leftThigh },
                { key: "rightThigh", name: "R. Oberschenkel", color: CHART_COLORS.rightThigh },
                { key: "leftCalf", name: "L. Wade", color: CHART_COLORS.leftCalf },
                { key: "rightCalf", name: "R. Wade", color: CHART_COLORS.rightCalf },
              ],
              "cm"
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
