import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VoiceOverlayProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  status?: 'listening' | 'processing' | 'speaking';
}

export function VoiceOverlay({ isListening, isSpeaking, transcript, status }: VoiceOverlayProps) {
  if (!isListening && !isSpeaking) return null;

  const displayStatus = status || (isSpeaking ? 'speaking' : 'listening');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="flex flex-col items-center gap-6 p-8"
        >
          {/* Pulsing Circle */}
          <div className="relative">
            <motion.div
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center",
                displayStatus === 'speaking' 
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                  : "bg-gradient-to-br from-primary to-primary/80"
              )}
              animate={displayStatus === 'listening' ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Waveform visualization */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-white/90 rounded-full"
                    animate={{
                      height: displayStatus === 'listening' || displayStatus === 'speaking'
                        ? [12, 24 + Math.random() * 16, 12]
                        : 12
                    }}
                    transition={{
                      duration: 0.4 + Math.random() * 0.3,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Outer rings */}
            {displayStatus === 'listening' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </div>

          {/* Status Text */}
          <motion.p
            key={displayStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-foreground"
          >
            {displayStatus === 'listening' && 'Höre zu...'}
            {displayStatus === 'processing' && 'Verarbeite...'}
            {displayStatus === 'speaking' && 'Spricht...'}
          </motion.p>

          {/* Transcript */}
          {transcript && displayStatus === 'listening' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xs px-4 py-2 rounded-xl bg-card/50 border border-border/50"
            >
              <p className="text-sm text-muted-foreground text-center">"{transcript}"</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
