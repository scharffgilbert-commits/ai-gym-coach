export interface UserContext {
  userName?: string;
  userGoals?: string[];
  experienceLevel?: string;
  injuries?: string[];
  currentWorkout?: {
    exerciseName?: string;
    sets?: number;
    reps?: number;
    weight?: number;
  };
  language?: string;
}

export const buildCoachSystemPrompt = (context: UserContext): string => {
  const { userName, userGoals, experienceLevel, injuries, currentWorkout, language } = context;
  
  const languageInstructions = language === 'de' 
    ? 'Antworte auf Deutsch, locker aber respektvoll.'
    : language === 'es'
    ? 'Responde en español, de manera amigable pero respetuosa.'
    : language === 'fr'
    ? 'Réponds en français, de manière amicale mais respectueuse.'
    : language === 'it'
    ? 'Rispondi in italiano, in modo amichevole ma rispettoso.'
    : language === 'pt'
    ? 'Responda em português, de forma amigável mas respeitosa.'
    : 'Reply in English, friendly but respectful.';

  return `Du bist FitAI Coach, ein freundlicher und motivierender Fitness-Trainer in einer Gym-App.

Kontext über den User:
- Name: ${userName || 'Athlete'}
- Ziele: ${userGoals?.join(', ') || 'Allgemeine Fitness'}
- Erfahrungslevel: ${experienceLevel || 'Anfänger'}
- Verletzungen/Einschränkungen: ${injuries?.length ? injuries.join(', ') : 'Keine bekannt'}
${currentWorkout ? `- Aktuelles Workout: ${currentWorkout.exerciseName} - ${currentWorkout.sets} Sätze × ${currentWorkout.reps} Wdh @ ${currentWorkout.weight}kg` : ''}

Regeln:
1. Antworte kurz und prägnant (max 2-3 Sätze)
2. Sei motivierend aber nicht übertrieben
3. Gib konkrete, actionable Tipps
4. Bei Übungsfragen: Erkläre Ausführung und häufige Fehler
5. Bei Schmerzen: Empfehle Vorsicht und ggf. Arztbesuch
6. ${languageInstructions}
7. Verwende gelegentlich passende Emojis 💪🔥

Beispielantworten:
- "Super Frage! Bei Bankdrücken achte auf: Schulterblätter zusammen, Füße fest am Boden, kontrollierte Bewegung. Häufiger Fehler: zu schnelles Absenken. 💪"
- "Nach so einem intensiven Beintraining empfehle ich 48h Pause für die Beine. Morgen wäre ein guter Tag für Oberkörper! 🔥"
`;
};

export const QUICK_ACTIONS = {
  de: [
    { label: 'Übung erklären', prompt: 'Erkläre mir, wie ich die aktuelle Übung richtig ausführe.' },
    { label: 'Workout anpassen', prompt: 'Kannst du mir eine Alternative zur aktuellen Übung vorschlagen?' },
    { label: 'Motivation', prompt: 'Gib mir einen motivierenden Spruch für mein Training!' },
    { label: 'Ernährungstipp', prompt: 'Was sollte ich nach dem Training essen?' },
  ],
  en: [
    { label: 'Explain exercise', prompt: 'Explain how to properly perform the current exercise.' },
    { label: 'Adjust workout', prompt: 'Can you suggest an alternative to the current exercise?' },
    { label: 'Motivation', prompt: 'Give me a motivating quote for my workout!' },
    { label: 'Nutrition tip', prompt: 'What should I eat after training?' },
  ],
  es: [
    { label: 'Explicar ejercicio', prompt: 'Explícame cómo realizar correctamente el ejercicio actual.' },
    { label: 'Ajustar entrenamiento', prompt: '¿Puedes sugerirme una alternativa al ejercicio actual?' },
    { label: 'Motivación', prompt: '¡Dame una frase motivadora para mi entrenamiento!' },
    { label: 'Consejo nutrición', prompt: '¿Qué debería comer después del entrenamiento?' },
  ],
  fr: [
    { label: 'Expliquer exercice', prompt: 'Explique-moi comment réaliser correctement l\'exercice actuel.' },
    { label: 'Ajuster entraînement', prompt: 'Peux-tu me suggérer une alternative à l\'exercice actuel?' },
    { label: 'Motivation', prompt: 'Donne-moi une citation motivante pour mon entraînement!' },
    { label: 'Conseil nutrition', prompt: 'Que devrais-je manger après l\'entraînement?' },
  ],
  it: [
    { label: 'Spiegare esercizio', prompt: 'Spiegami come eseguire correttamente l\'esercizio attuale.' },
    { label: 'Adattare allenamento', prompt: 'Puoi suggerirmi un\'alternativa all\'esercizio attuale?' },
    { label: 'Motivazione', prompt: 'Dammi una frase motivante per il mio allenamento!' },
    { label: 'Consiglio nutrizione', prompt: 'Cosa dovrei mangiare dopo l\'allenamento?' },
  ],
  pt: [
    { label: 'Explicar exercício', prompt: 'Explique-me como realizar corretamente o exercício atual.' },
    { label: 'Ajustar treino', prompt: 'Pode sugerir uma alternativa ao exercício atual?' },
    { label: 'Motivação', prompt: 'Dê-me uma frase motivadora para o meu treino!' },
    { label: 'Dica nutrição', prompt: 'O que devo comer após o treino?' },
  ],
};
