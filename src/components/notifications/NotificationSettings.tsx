import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Dumbbell, Droplets, Flame, Check } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

interface NotificationSettingsProps {
  onBack: () => void;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const {
    isSupported,
    permission,
    schedule,
    requestPermission,
    saveSchedule,
    sendNotification,
  } = usePushNotifications();

  const [localSchedule, setLocalSchedule] = useState(schedule);

  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Benachrichtigungen aktiviert!');
      // Send test notification
      sendNotification(
        '🎉 Benachrichtigungen aktiviert!',
        'Du erhältst jetzt Erinnerungen für deine Fitness-Ziele.'
      );
    } else {
      toast.error('Benachrichtigungen wurden abgelehnt');
    }
  };

  const handleSave = () => {
    saveSchedule(localSchedule);
    toast.success('Einstellungen gespeichert');
  };

  const handleTestNotification = () => {
    sendNotification(
      '🧪 Test Benachrichtigung',
      'So sehen deine Erinnerungen aus!'
    );
    toast.success('Test-Benachrichtigung gesendet');
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader 
          title="Benachrichtigungen" 
          subtitle="Erinnerungen konfigurieren"
          showBack
          onBack={onBack}
        />
        <div className="p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <BellOff className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Dein Browser unterstützt keine Push-Benachrichtigungen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title="Benachrichtigungen" 
        subtitle="Erinnerungen konfigurieren"
        showBack
        onBack={onBack}
      />

      <div className="p-4 space-y-4">
        {permission !== 'granted' ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Bell className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="font-semibold">Benachrichtigungen aktivieren</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Erhalte Erinnerungen für Workouts, Streaks und Wasserzufuhr.
                  </p>
                </div>
                <Button onClick={handleEnableNotifications} className="gap-2">
                  <Bell className="h-4 w-4" />
                  Aktivieren
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-primary/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 text-primary">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Benachrichtigungen aktiv</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Workout-Erinnerung
                </CardTitle>
                <CardDescription>
                  Tägliche Erinnerung zum Trainieren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="workoutReminder">Aktiviert</Label>
                  <Switch
                    id="workoutReminder"
                    checked={localSchedule.workoutReminder}
                    onCheckedChange={(checked) => 
                      setLocalSchedule({ ...localSchedule, workoutReminder: checked })
                    }
                  />
                </div>
                {localSchedule.workoutReminder && (
                  <div>
                    <Label htmlFor="workoutTime">Uhrzeit</Label>
                    <Input
                      id="workoutTime"
                      type="time"
                      value={localSchedule.workoutTime}
                      onChange={(e) => 
                        setLocalSchedule({ ...localSchedule, workoutTime: e.target.value })
                      }
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Streak-Erinnerung
                </CardTitle>
                <CardDescription>
                  Warnung wenn dein Streak in Gefahr ist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="streakReminder">Aktiviert</Label>
                  <Switch
                    id="streakReminder"
                    checked={localSchedule.streakReminder}
                    onCheckedChange={(checked) => 
                      setLocalSchedule({ ...localSchedule, streakReminder: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Wasser-Erinnerung
                </CardTitle>
                <CardDescription>
                  Regelmäßige Erinnerung zu trinken
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="waterReminder">Aktiviert</Label>
                  <Switch
                    id="waterReminder"
                    checked={localSchedule.waterReminder}
                    onCheckedChange={(checked) => 
                      setLocalSchedule({ ...localSchedule, waterReminder: checked })
                    }
                  />
                </div>
                {localSchedule.waterReminder && (
                  <div>
                    <Label htmlFor="waterInterval">Intervall (Stunden)</Label>
                    <Input
                      id="waterInterval"
                      type="number"
                      min="1"
                      max="8"
                      value={localSchedule.waterInterval}
                      onChange={(e) => 
                        setLocalSchedule({ ...localSchedule, waterInterval: parseInt(e.target.value) || 2 })
                      }
                      className="w-20"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Speichern
              </Button>
              <Button variant="outline" onClick={handleTestNotification}>
                Test
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
