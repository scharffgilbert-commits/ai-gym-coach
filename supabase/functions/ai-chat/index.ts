import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserContext {
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

const buildSystemPrompt = (context: UserContext): string => {
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
`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('AI Chat request received:', { messagesCount: messages?.length, userContext });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: buildSystemPrompt(userContext || {}) },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('AI Chat response generated successfully');

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        content: 'Es gab einen Fehler bei der Verarbeitung. Bitte versuche es erneut.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
