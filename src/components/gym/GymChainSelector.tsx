import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GymChain {
  id: string;
  name: string;
  logo_url: string | null;
  default_equipment: string[];
}

interface GymChainSelectorProps {
  onSelect: (chain: GymChain | null, gymName: string) => void;
  onSkip?: () => void;
}

export function GymChainSelector({ onSelect, onSkip }: GymChainSelectorProps) {
  const [chains, setChains] = useState<GymChain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<GymChain | null>(null);
  const [customGymName, setCustomGymName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    loadChains();
  }, []);

  const loadChains = async () => {
    try {
      const { data, error } = await supabase
        .from('gym_chains')
        .select('*')
        .order('name');

      if (error) throw error;

      const formattedChains = data.map(chain => ({
        ...chain,
        default_equipment: Array.isArray(chain.default_equipment) 
          ? chain.default_equipment 
          : JSON.parse(chain.default_equipment as string || '[]')
      }));

      setChains(formattedChains);
    } catch (error) {
      console.error('Error loading gym chains:', error);
      toast.error('Fehler beim Laden der Fitnessketten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (showCustom && customGymName) {
      onSelect(null, customGymName);
    } else if (selectedChain) {
      onSelect(selectedChain, selectedChain.name);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Wähle deine Fitnesskette</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bekannte Ketten haben vorkonfigurierte Geräte
        </p>
      </div>

      {!showCustom ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {chains.map((chain) => (
              <motion.button
                key={chain.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChain(selectedChain?.id === chain.id ? null : chain)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                  selectedChain?.id === chain.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {selectedChain?.id === chain.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{chain.name}</span>
                <span className="text-xs text-muted-foreground">
                  {chain.default_equipment.length} Geräte
                </span>
              </motion.button>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCustom(true)}
          >
            <Plus className="h-4 w-4" />
            Eigenes Fitnessstudio
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gymName">Name des Fitnessstudios</Label>
            <Input
              id="gymName"
              placeholder="z.B. Mein Gym, Studio XY..."
              value={customGymName}
              onChange={(e) => setCustomGymName(e.target.value)}
              className="h-14"
            />
          </div>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setShowCustom(false);
              setCustomGymName('');
            }}
          >
            Zurück zur Auswahl
          </Button>
        </div>
      )}

      {selectedChain && (
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground">Vorhandene Geräte bei {selectedChain.name}:</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedChain.default_equipment.slice(0, 6).map((equip, i) => (
              <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {equip}
              </span>
            ))}
            {selectedChain.default_equipment.length > 6 && (
              <span className="text-xs text-muted-foreground">
                +{selectedChain.default_equipment.length - 6} weitere
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {onSkip && (
          <Button variant="ghost" className="flex-1" onClick={onSkip}>
            Überspringen
          </Button>
        )}
        <Button
          variant="hero"
          className="flex-1"
          onClick={handleContinue}
          disabled={!selectedChain && !customGymName}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
