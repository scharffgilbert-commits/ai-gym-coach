import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language, TranslationKey, languageNames, languageFlags } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  languageNames: typeof languageNames;
  languageFlags: typeof languageFlags;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'fitai_language';

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  if (browserLang in translations) {
    return browserLang as Language;
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in translations) {
      return stored as Language;
    }
    return detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  const availableLanguages: Language[] = ['de', 'en', 'es', 'fr', 'it', 'pt'];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      languageNames,
      languageFlags,
      availableLanguages,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}
