import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface RestTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function RestTimer({ initialSeconds, onComplete, autoStart = true }: RestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    
    // Create audio context for beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playSound();
          onComplete?.();
          return 0;
        }
        // Play tick sound at 3, 2, 1
        if (prev <= 4 && prev > 1) {
          playSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, onComplete, playSound]);

  const handleReset = () => {
    setTimeRemaining(initialSeconds);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeRemaining / initialSeconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <ProgressRing
        progress={progress}
        size={180}
        strokeWidth={10}
        color={timeRemaining <= 10 ? 'warning' : 'primary'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={timeRemaining}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <span className={`text-4xl font-bold ${timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'}`}>
              {formatTime(timeRemaining)}
            </span>
          </motion.div>
        </AnimatePresence>
      </ProgressRing>

      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-full"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Button
          variant={isRunning ? 'secondary' : 'default'}
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className="min-w-[120px] rounded-full"
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {timeRemaining === initialSeconds ? 'Start' : 'Resume'}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="rounded-full"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {timeRemaining === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-lg font-semibold text-success"
        >
          Zeit abgelaufen! Weiter geht's!
        </motion.p>
      )}
    </motion.div>
  );
}
