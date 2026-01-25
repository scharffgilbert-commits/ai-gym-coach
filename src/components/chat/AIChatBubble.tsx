import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AIChatBubbleProps {
  currentExercise?: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  };
  className?: string;
}

export function AIChatBubble({ currentExercise, className }: AIChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Don't show if not authenticated
  if (!user) return null;

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            onClose={() => setIsOpen(false)}
            currentExercise={currentExercise}
          />
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-lg',
          'gradient-primary flex items-center justify-center',
          'hover:shadow-glow transition-shadow duration-300',
          'sm:bottom-28 sm:right-6',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Sparkles className="w-6 h-6 text-primary-foreground" />
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary-foreground/30"
                animate={{
                  scale: [1, 1.5, 1.5],
                  opacity: [0.5, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
