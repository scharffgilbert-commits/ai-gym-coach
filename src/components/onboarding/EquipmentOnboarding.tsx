import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, Loader2, ChevronRight, Plus, Dumbbell, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GymChainSelector } from '@/components/gym/GymChainSelector';
import { toast } from 'sonner';

interface EquipmentOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface DetectedMachine {
  name: string;
  category: string;
  muscleGroups: string[];
  imageUrl?: string;
}

type Step = 'gym-select' | 'intro' | 'capture' | 'analyzing' | 'review';

export function EquipmentOnboarding({ onComplete, onSkip }: EquipmentOnboardingProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<Step>('gym-select');
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymName, setGymName] = useState('');
  const [chainId, setChainId] = useState<string | null>(null);
  const [machines, setMachines] = useState<DetectedMachine[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleGymSelect = async (chain: any, name: string) => {
    if (!user) return;

    try {
      // Create gym in database
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .insert({
          user_id: user.id,
          name: name,
          chain_id: chain?.id || null,
        })
        .select()
        .single();

      if (gymError) throw gymError;

      setGymId(gymData.id);
      setGymName(name);
      setChainId(chain?.id || null);

      // If chain selected, pre-populate with default equipment
      if (chain?.default_equipment?.length > 0) {
        const defaultMachines: DetectedMachine[] = chain.default_equipment.map((name: string) => ({
          name,
          category: 'functional',
          muscleGroups: [],
        }));
        setMachines(defaultMachines);
      }

      setStep('intro');
    } catch (error) {
      console.error('Error creating gym:', error);
      toast.error('Fehler beim Erstellen des Fitnessstudios');
    }
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCurrentImage(url);
    setStep('analyzing');
    setIsAnalyzing(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      const { data, error } = await supabase.functions.invoke('analyze-equipment', {
        body: { imageBase64 },
      });

      if (error) throw error;

      const newMachine: DetectedMachine = {
        name: data.name || 'Unbekanntes Gerät',
        category: data.category || 'functional',
        muscleGroups: data.muscleGroups || [],
        imageUrl: url,
      };

      setMachines(prev => [...prev, newMachine]);
      toast.success(`${newMachine.name} erkannt!`);
      setStep('capture');
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Erkennung fehlgeschlagen. Versuche es erneut.');
      setStep('capture');
    } finally {
      setIsAnalyzing(false);
      setCurrentImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveAndComplete = async () => {
    if (!user || !gymId) return;

    try {
      // Save all machines to database
      const machineInserts = machines.map(m => ({
        user_id: user.id,
        gym_id: gymId,
        name: m.name,
        category: m.category,
        muscle_groups: m.muscleGroups,
        ai_detected: true,
        user_confirmed: true,
      }));

      if (machineInserts.length > 0) {
        const { error } = await supabase
          .from('machines')
          .insert(machineInserts);

        if (error) throw error;
      }

      // Mark equipment onboarding as complete
      await supabase
        .from('profiles')
        .update({ equipment_onboarding_complete: true })
        .eq('user_id', user.id);

      toast.success(`${machines.length} Geräte gespeichert!`);
      onComplete();
    } catch (error) {
      console.error('Error saving machines:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {/* Gym Selection */}
        {step === 'gym-select' && (
          <motion.div
            key="gym-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 py-12"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <GymChainSelector 
              onSelect={handleGymSelect}
              onSkip={onSkip}
            />
          </motion.div>
        )}

        {/* Introduction */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
            >
              <Camera className="h-10 w-10 text-primary" />
            </motion.div>

            <h2 className="text-center text-2xl font-bold text-foreground">
              Fotografiere deine Geräte
            </h2>
            <p className="mt-4 max-w-sm text-center text-muted-foreground">
              Scanne die Trainingsgeräte in deinem Fitnessstudio. 
              Die KI erkennt sie automatisch und erstellt deinen ersten Trainingsplan.
            </p>

            {machines.length > 0 && (
              <div className="mt-6 rounded-2xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{machines.length}</span> Geräte bereits erfasst
                </p>
              </div>
            )}

            <div className="mt-8 w-full max-w-sm space-y-3">
              <Button variant="hero" size="xl" className="w-full" onClick={() => setStep('capture')}>
                <Camera className="h-5 w-5" />
                Geräte scannen
              </Button>
              {machines.length > 0 && (
                <Button variant="outline" size="xl" className="w-full" onClick={() => setStep('review')}>
                  Übersicht ({machines.length} Geräte)
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Capture */}
        {step === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 py-12"
          >
            <button onClick={() => setStep('intro')} className="mb-6 text-muted-foreground">
              ← Zurück
            </button>

            <h3 className="text-xl font-semibold text-foreground">
              Gerät fotografieren
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {machines.length} Geräte erfasst
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 flex h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card transition-all hover:border-primary"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <p className="mt-4 font-medium text-foreground">Foto aufnehmen</p>
              <p className="text-sm text-muted-foreground">oder tippen zum Hochladen</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageCapture}
              />
            </div>

            {machines.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-foreground">Erfasste Geräte:</p>
                <div className="flex flex-wrap gap-2">
                  {machines.slice(-5).map((m, i) => (
                    <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                      {m.name}
                    </span>
                  ))}
                  {machines.length > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{machines.length - 5} weitere
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
              {machines.length >= 3 && (
                <Button variant="hero" size="xl" className="w-full" onClick={handleSaveAndComplete}>
                  Fertig - Plan erstellen
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
              <Button variant="outline" size="lg" className="w-full" onClick={() => setStep('review')}>
                Alle Geräte ansehen ({machines.length})
              </Button>
            </div>
          </motion.div>
        )}

        {/* Analyzing */}
        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen flex-col items-center justify-center px-6"
          >
            {currentImage && (
              <div className="relative mb-8 h-48 w-48 overflow-hidden rounded-3xl">
                <img src={currentImage} alt="Aufnahme" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              </div>
            )}
            <h3 className="text-xl font-semibold text-foreground">Analysiere Bild...</h3>
            <p className="mt-2 text-muted-foreground">KI erkennt das Gerät</p>
          </motion.div>
        )}

        {/* Review */}
        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 py-12"
          >
            <button onClick={() => setStep('capture')} className="mb-6 text-muted-foreground">
              ← Zurück
            </button>

            <h3 className="text-xl font-semibold text-foreground">
              Deine Geräte bei {gymName}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {machines.length} Geräte erfasst
            </p>

            <div className="mt-6 space-y-3">
              {machines.map((machine, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{machine.name}</p>
                    <p className="text-sm text-muted-foreground">{machine.category}</p>
                  </div>
                  <Check className="h-5 w-5 text-success" />
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <Button variant="outline" className="w-full" onClick={() => setStep('capture')}>
                <Plus className="h-4 w-4" />
                Weitere Geräte scannen
              </Button>
              <Button variant="hero" size="xl" className="w-full" onClick={handleSaveAndComplete}>
                Speichern & Plan erstellen
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
