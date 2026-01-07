import { motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';

interface LanguageSelectorProps {
  onSelect?: () => void;
}

export function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const { language, setLanguage, languageNames, languageFlags, availableLanguages, t } = useLanguage();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    onSelect?.();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{t('settings_language')}</h3>
      </div>
      
      <div className="grid gap-2">
        {availableLanguages.map((lang) => (
          <motion.button
            key={lang}
            onClick={() => handleSelect(lang)}
            className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
              language === lang 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-card hover:border-primary/50'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{languageFlags[lang]}</span>
              <span className="font-medium text-foreground">{languageNames[lang]}</span>
            </div>
            {language === lang && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
