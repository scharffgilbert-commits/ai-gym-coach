import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { buildCoachSystemPrompt, UserContext } from '@/lib/aiPrompts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAIChatOptions {
  currentExercise?: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  };
}

export function useAIChat(options?: UseAIChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user: authUser } = useAuth();
  const { user, healthProfile, fitnessGoals } = useApp();
  const { language } = useLanguage();

  // Load chat history on mount
  useEffect(() => {
    if (!authUser?.id) return;
    
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (!error && data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        })));
      }
    };
    
    loadHistory();
  }, [authUser?.id]);

  const buildContext = useCallback((): UserContext => {
    const injuryAreas = healthProfile?.injuries?.map((i: any) => 
      typeof i === 'string' ? i : i.area || 'unknown'
    ) || [];
    
    return {
      userName: user?.name || undefined,
      userGoals: fitnessGoals?.focusAreas || undefined,
      experienceLevel: fitnessGoals?.experienceLevel || undefined,
      injuries: injuryAreas.length > 0 ? injuryAreas : undefined,
      currentWorkout: options?.currentExercise ? {
        exerciseName: options.currentExercise.name,
        sets: options.currentExercise.sets,
        reps: options.currentExercise.reps,
        weight: options.currentExercise.weight,
      } : undefined,
      language,
    };
  }, [user, healthProfile, fitnessGoals, options?.currentExercise, language]);

  const sendMessage = useCallback(async (content: string) => {
    if (!authUser?.id || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase.from('chat_messages').insert([{
        user_id: authUser.id,
        role: 'user',
        content: content.trim(),
        context: buildContext() as any,
      }]);

      // Build messages for AI
      const aiMessages = [
        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: content.trim() },
      ];

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: aiMessages,
          userContext: buildContext(),
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content || 'Entschuldige, ich konnte keine Antwort generieren.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from('chat_messages').insert([{
        user_id: authUser.id,
        role: 'assistant',
        content: assistantMessage.content,
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Es gab einen Fehler. Bitte versuche es erneut.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id, messages, buildContext]);

  const clearHistory = useCallback(async () => {
    if (!authUser?.id) return;
    
    await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', authUser.id);
    
    setMessages([]);
  }, [authUser?.id]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  };
}
