import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language, TranslationKey, languageNames, languageFlags } from './translations';
import { supabase } from '@/integrations/supabase/client';

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
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth changes and load language from database
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        
        // Load language from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (profile?.language && profile.language in translations) {
          setLanguageState(profile.language as Language);
          localStorage.setItem(STORAGE_KEY, profile.language);
        }
      } else {
        setUserId(null);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (profile?.language && profile.language in translations) {
          setLanguageState(profile.language as Language);
          localStorage.setItem(STORAGE_KEY, profile.language);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save to localStorage and database when language changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Save to database if user is authenticated
    if (userId) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('user_id', userId);
    }
  }, [userId]);

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
