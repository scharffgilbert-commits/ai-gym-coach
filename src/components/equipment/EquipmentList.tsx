import { motion } from 'framer-motion';
import { Plus, Camera, Dumbbell, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { MachineCategory } from '@/types/fitness';

interface EquipmentListProps {
  onBack: () => void;
  onAddEquipment: () => void;
}

const categoryEmoji: Record<MachineCategory, string> = {
  chest: '💪',
  back: '🔙',
  shoulders: '🎯',
  arms: '💪',
  legs: '🦵',
  core: '🔥',
  cardio: '❤️',
  functional: '⚡',
  'free-weights': '🏋️',
};

export function EquipmentList({ onBack, onAddEquipment }: EquipmentListProps) {
  const { gyms, setGyms } = useApp();
  
  const machines = gyms[0]?.machines || [];
  const groupedMachines = machines.reduce((acc, machine) => {
    if (!acc[machine.category]) {
      acc[machine.category] = [];
    }
    acc[machine.category].push(machine);
    return acc;
  }, {} as Record<string, typeof machines>);

  const handleDelete = (machineId: string) => {
    if (gyms.length > 0) {
      const updatedGyms = [...gyms];
      updatedGyms[0].machines = updatedGyms[0].machines.filter((m) => m.id !== machineId);
      setGyms(updatedGyms);
    }
  };

  return (
    <div className="min-h-screen pb-32 safe-area-bottom bg-background">
      <PageHeader
        title="My Equipment"
        subtitle={`${machines.length} machines in your gym`}
        rightElement={
          <Button variant="ghost" size="icon" onClick={onAddEquipment}>
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 space-y-6">
        {machines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <Dumbbell className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-foreground">No equipment yet</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Add your gym machines to get personalized workouts
            </p>
            <Button variant="hero" size="lg" className="mt-8" onClick={onAddEquipment}>
              <Camera className="h-5 w-5" />
              Add Equipment
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Quick add button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onAddEquipment}
              className="flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-border p-4 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Add new equipment</p>
                <p className="text-sm text-muted-foreground">Photo or manual entry</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </motion.button>

            {/* Equipment by category */}
            {Object.entries(groupedMachines).map(([category, categoryMachines], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>{categoryEmoji[category as MachineCategory]}</span>
                  {category.replace('-', ' ')}
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
                    {categoryMachines.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {categoryMachines.map((machine, i) => (
                    <motion.div
                      key={machine.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card"
                    >
                      {machine.imageUrl ? (
                        <img
                          src={machine.imageUrl}
                          alt={machine.name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                          <Dumbbell className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{machine.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {machine.muscleGroups.length} muscle groups
                          {machine.manufacturer && ` • ${machine.manufacturer}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(machine.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
