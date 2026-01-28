import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface VoiceModeToggleProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  onToggle: () => void;
  className?: string;
}

export function VoiceModeToggle({ 
  isActive, 
  isListening, 
  isSpeaking, 
  isSupported, 
  onToggle,
  className 
}: VoiceModeToggleProps) {
  const { t } = useLanguage();

  if (!isSupported) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={className}
          >
            <Button
              variant={isActive ? "default" : "outline"}
              size="icon"
              onClick={onToggle}
              className={cn(
                "relative transition-all",
                isActive && "gradient-primary shadow-glow"
              )}
            >
              <AnimatePresence mode="wait">
                {isSpeaking ? (
                  <motion.div
                    key="speaking"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Volume2 className="h-5 w-5" />
                  </motion.div>
                ) : isListening ? (
                  <motion.div
                    key="listening"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Mic className="h-5 w-5" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    key="active"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Mic className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="inactive"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <MicOff className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {isActive && isListening && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isActive ? t('voice_mode_active' as keyof typeof import('@/i18n/translations').translations.de) : t('voice_mode_inactive' as keyof typeof import('@/i18n/translations').translations.de)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
