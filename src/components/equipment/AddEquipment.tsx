import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check, Loader2, Dumbbell, ChevronRight, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Machine, MachineCategory, MuscleGroup } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNativeCamera } from '@/hooks/useNativeCamera';

interface AddEquipmentProps {
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'capture' | 'analyzing' | 'confirm' | 'details' | 'complete';

export function AddEquipment({ onBack, onComplete }: AddEquipmentProps) {
  const { gyms, addGym, setGyms } = useApp();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { takePhoto, pickFromGallery, isNative, isLoading: cameraLoading } = useNativeCamera();
  
  const [step, setStep] = useState<Step>('capture');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Detected/confirmed machine data
  const [machineData, setMachineData] = useState<Partial<Machine>>({
    name: '',
    category: 'chest',
    muscleGroups: [],
    manufacturer: '',
    aiDetected: true,
    userConfirmed: false,
  });

  const categories: { id: MachineCategory; label: string; emoji: string }[] = [
    { id: 'chest', label: 'Chest', emoji: '💪' },
    { id: 'back', label: 'Back', emoji: '🔙' },
    { id: 'shoulders', label: 'Shoulders', emoji: '🎯' },
    { id: 'arms', label: 'Arms', emoji: '💪' },
    { id: 'legs', label: 'Legs', emoji: '🦵' },
    { id: 'core', label: 'Core', emoji: '🔥' },
    { id: 'cardio', label: 'Cardio', emoji: '❤️' },
    { id: 'functional', label: 'Functional', emoji: '⚡' },
    { id: 'free-weights', label: 'Free Weights', emoji: '🏋️' },
  ];

  const muscleGroups: { id: MuscleGroup; label: string }[] = [
    { id: 'pectorals', label: 'Pectorals' },
    { id: 'deltoids', label: 'Deltoids' },
    { id: 'latissimus-dorsi', label: 'Lats' },
    { id: 'trapezius', label: 'Traps' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'quadriceps', label: 'Quads' },
    { id: 'hamstrings', label: 'Hamstrings' },
    { id: 'glutes', label: 'Glutes' },
    { id: 'calves', label: 'Calves' },
    { id: 'rectus-abdominis', label: 'Abs' },
    { id: 'obliques', label: 'Obliques' },
    { id: 'erector-spinae', label: 'Lower Back' },
  ];

  // Shared AI analysis function
  const analyzeEquipmentWithAI = async (imageBase64: string, previewUrl?: string) => {
    setImageUrl(previewUrl || imageBase64);
    setStep('analyzing');
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-equipment', {
        body: { imageBase64 },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Map the AI response to our machine data format
      setMachineData({
        name: data.name || 'Unknown Machine',
        category: (data.category as MachineCategory) || 'functional',
        muscleGroups: (data.muscleGroups as MuscleGroup[]) || [],
        manufacturer: data.manufacturer || '',
        aiDetected: true,
        userConfirmed: false,
      });

      toast({
        title: 'Equipment detected!',
        description: `AI identified: ${data.name}${data.confidence ? ` (${Math.round(data.confidence * 100)}% confident)` : ''}`,
      });

      setStep('confirm');
    } catch (error) {
      console.error('Error analyzing equipment:', error);
      toast({
        title: 'Detection failed',
        description: 'Could not analyze the image. Please add details manually.',
        variant: 'destructive',
      });
      setStep('details');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Native camera capture
  const handleNativeCapture = async (source: 'camera' | 'gallery') => {
    try {
      const imageBase64 = source === 'camera' ? await takePhoto() : await pickFromGallery();
      if (imageBase64) {
        await analyzeEquipmentWithAI(imageBase64);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Failed to access camera',
        variant: 'destructive',
      });
    }
  };

  // Web fallback capture
  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      await analyzeEquipmentWithAI(imageBase64, url);
    }
  };

  const handleConfirm = () => {
    setMachineData({ ...machineData, userConfirmed: true });
    setStep('details');
  };

  const handleSave = async () => {
    if (!authUser?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save equipment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create or get gym in Supabase
      let gymId = gyms[0]?.id;
      
      if (!gymId || gymId === 'default-gym') {
        const { data: savedGym, error: gymError } = await supabase
          .from('gyms')
          .insert({
            user_id: authUser.id,
            name: 'My Gym',
          })
          .select()
          .single();
        
        if (gymError) throw gymError;
        gymId = savedGym.id;
      }

      // Save machine to Supabase
      const { data: savedMachine, error: machineError } = await supabase
        .from('machines')
        .insert({
          user_id: authUser.id,
          gym_id: gymId,
          name: machineData.name || 'Unknown Machine',
          category: machineData.category || 'chest',
          muscle_groups: machineData.muscleGroups || [],
          manufacturer: machineData.manufacturer || null,
          image_url: imageUrl || null,
          ai_detected: machineData.aiDetected || false,
          user_confirmed: true,
        })
        .select()
        .single();

      if (machineError) throw machineError;

      // Update local state
      const newMachine: Machine = {
        id: savedMachine.id,
        gymId: gymId,
        name: savedMachine.name,
        category: savedMachine.category as MachineCategory || 'chest',
        muscleGroups: (savedMachine.muscle_groups as MuscleGroup[]) || [],
        manufacturer: savedMachine.manufacturer || undefined,
        imageUrl: savedMachine.image_url || undefined,
        aiDetected: savedMachine.ai_detected || false,
        userConfirmed: savedMachine.user_confirmed || true,
      };

      if (gyms.length === 0) {
        addGym({
          id: gymId,
          name: 'My Gym',
          userId: authUser.id,
          machines: [newMachine],
          createdAt: new Date(),
        });
      } else {
        const updatedGyms = [...gyms];
        updatedGyms[0].machines.push(newMachine);
        setGyms(updatedGyms);
      }

      toast({
        title: 'Equipment added!',
        description: `${machineData.name} has been added to your gym.`,
      });

      setStep('complete');
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save equipment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddAnother = () => {
    setStep('capture');
    setImageUrl(null);
    setMachineData({
      name: '',
      category: 'chest',
      muscleGroups: [],
      manufacturer: '',
      aiDetected: true,
      userConfirmed: false,
    });
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <PageHeader
        title="Add Equipment"
        subtitle="Take a photo or describe your machine"
        showBack
        onBack={onBack}
      />

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* Capture Step */}
          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Native Camera Buttons */}
              {isNative ? (
                <div className="space-y-3">
                  <Button
                    variant="hero"
                    size="xl"
                    className="w-full"
                    onClick={() => handleNativeCapture('camera')}
                    disabled={cameraLoading}
                  >
                    {cameraLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                    Take a Photo
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => handleNativeCapture('gallery')}
                    disabled={cameraLoading}
                  >
                    <Image className="h-5 w-5" />
                    Choose from Gallery
                  </Button>
                </div>
              ) : (
                /* Web Fallback */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Camera className="h-8 w-8" />
                  </div>
                  <p className="mt-4 font-medium text-foreground">Take a photo</p>
                  <p className="text-sm text-muted-foreground">or tap to upload</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="outline"
                size="xl"
                className="w-full"
                onClick={() => setStep('details')}
              >
                <Dumbbell className="h-5 w-5" />
                Add Manually
              </Button>

              <div className="rounded-2xl bg-muted/50 p-4">
                <h4 className="font-medium text-foreground">Tips for best results</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Capture the full machine in the frame</li>
                  <li>• Include any brand/model labels</li>
                  <li>• Good lighting helps AI detection</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Analyzing Step */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12"
            >
              {imageUrl && (
                <div className="relative mb-8 h-48 w-48 overflow-hidden rounded-3xl">
                  <img src={imageUrl} alt="Captured" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <h3 className="text-xl font-semibold text-foreground">Analyzing image...</h3>
              <p className="mt-2 text-muted-foreground">AI is detecting your equipment</p>
              
              <div className="mt-6 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 w-3 rounded-full bg-primary"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {imageUrl && (
                <div className="relative overflow-hidden rounded-3xl">
                  <img src={imageUrl} alt="Equipment" className="w-full object-cover" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-card/95 p-4 backdrop-blur-xl shadow-elevated">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 text-success">
                        <Check className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{machineData.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {machineData.manufacturer} • {machineData.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Is this correct?</h3>
                
                <div className="rounded-2xl bg-card p-4 shadow-card">
                  <Label className="text-muted-foreground">Muscle groups targeted</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {machineData.muscleGroups?.map((group) => (
                      <span
                        key={group}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      >
                        {muscleGroups.find((m) => m.id === group)?.label || group}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" onClick={() => setStep('details')}>
                    Edit Details
                  </Button>
                  <Button variant="hero" size="lg" onClick={handleConfirm}>
                    <Check className="h-5 w-5" />
                    Confirm
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Chest Press Machine"
                    value={machineData.name}
                    onChange={(e) => setMachineData({ ...machineData, name: e.target.value })}
                    className="h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer (optional)</Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Life Fitness, Technogym"
                    value={machineData.manufacturer || ''}
                    onChange={(e) => setMachineData({ ...machineData, manufacturer: e.target.value })}
                    className="h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setMachineData({ ...machineData, category: cat.id })}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                          machineData.category === cat.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Muscle Groups</Label>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          const current = machineData.muscleGroups || [];
                          if (current.includes(group.id)) {
                            setMachineData({
                              ...machineData,
                              muscleGroups: current.filter((g) => g !== group.id),
                            });
                          } else {
                            setMachineData({
                              ...machineData,
                              muscleGroups: [...current, group.id],
                            });
                          }
                        }}
                        className={`rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                          machineData.muscleGroups?.includes(group.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleSave}
                disabled={!machineData.name}
              >
                Save Equipment
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20"
              >
                <Check className="h-10 w-10 text-success" />
              </motion.div>
              
              <h3 className="mt-6 text-2xl font-bold text-foreground">Equipment Added!</h3>
              <p className="mt-2 text-muted-foreground">
                {machineData.name} is now in your gym
              </p>

              <div className="mt-8 w-full max-w-sm space-y-4">
                <Button variant="hero" size="xl" className="w-full" onClick={handleAddAnother}>
                  Add Another Machine
                </Button>
                <Button variant="outline" size="xl" className="w-full" onClick={onComplete}>
                  Done for Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
