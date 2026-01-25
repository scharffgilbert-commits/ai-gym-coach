export interface VoiceCommand {
  keywords: string[];
  action: string;
  response: string;
}

export const WORKOUT_COMMANDS: Record<string, VoiceCommand[]> = {
  de: [
    {
      keywords: ['fertig', 'done', 'nächste', 'weiter', 'geschafft'],
      action: 'COMPLETE_SET',
      response: 'Satz abgeschlossen! {remainingSets} Sätze übrig.'
    },
    {
      keywords: ['pause', 'stop', 'warte', 'halt'],
      action: 'PAUSE_WORKOUT',
      response: 'Workout pausiert. Sag "weiter" zum Fortfahren.'
    },
    {
      keywords: ['fortfahren', 'start', 'los', 'beginnen'],
      action: 'RESUME_WORKOUT',
      response: 'Los gehts! {exercise} - {sets} Sätze, {reps} Wiederholungen'
    },
    {
      keywords: ['wie viel', 'gewicht', 'welches gewicht'],
      action: 'READ_WEIGHT',
      response: 'Aktuelles Gewicht: {weight} Kilo'
    },
    {
      keywords: ['mehr gewicht', 'schwerer', 'erhöhe'],
      action: 'INCREASE_WEIGHT',
      response: 'Gewicht erhöht auf {newWeight} Kilo'
    },
    {
      keywords: ['weniger gewicht', 'leichter', 'reduziere'],
      action: 'DECREASE_WEIGHT',
      response: 'Gewicht reduziert auf {newWeight} Kilo'
    },
    {
      keywords: ['übung überspringen', 'skip', 'nächste übung'],
      action: 'SKIP_EXERCISE',
      response: 'Übung übersprungen. Weiter mit {nextExercise}'
    },
    {
      keywords: ['timer', 'pause zeit', 'wie lange noch'],
      action: 'READ_TIMER',
      response: 'Noch {seconds} Sekunden Pause'
    },
    {
      keywords: ['hilfe', 'befehle', 'was kann ich sagen'],
      action: 'LIST_COMMANDS',
      response: 'Du kannst sagen: Fertig, Pause, Weiter, Mehr Gewicht, Weniger Gewicht, oder Übung überspringen'
    },
    {
      keywords: ['beenden', 'workout beenden', 'aufhören', 'schluss'],
      action: 'END_WORKOUT',
      response: 'Möchtest du das Workout wirklich beenden? Sag "ja" zum Bestätigen.'
    },
    {
      keywords: ['ja', 'bestätigen', 'richtig'],
      action: 'CONFIRM',
      response: 'Verstanden!'
    },
    {
      keywords: ['nein', 'abbrechen', 'stopp', 'cancel'],
      action: 'CANCEL',
      response: 'Aktion abgebrochen.'
    }
  ],
  en: [
    {
      keywords: ['done', 'finished', 'next', 'complete'],
      action: 'COMPLETE_SET',
      response: 'Set complete! {remainingSets} sets remaining.'
    },
    {
      keywords: ['pause', 'stop', 'wait', 'hold'],
      action: 'PAUSE_WORKOUT',
      response: 'Workout paused. Say "continue" to resume.'
    },
    {
      keywords: ['continue', 'resume', 'start', 'go'],
      action: 'RESUME_WORKOUT',
      response: 'Let\'s go! {exercise} - {sets} sets, {reps} reps'
    },
    {
      keywords: ['how much', 'weight', 'what weight'],
      action: 'READ_WEIGHT',
      response: 'Current weight: {weight} kilos'
    },
    {
      keywords: ['more weight', 'heavier', 'increase'],
      action: 'INCREASE_WEIGHT',
      response: 'Weight increased to {newWeight} kilos'
    },
    {
      keywords: ['less weight', 'lighter', 'decrease'],
      action: 'DECREASE_WEIGHT',
      response: 'Weight decreased to {newWeight} kilos'
    },
    {
      keywords: ['skip exercise', 'skip', 'next exercise'],
      action: 'SKIP_EXERCISE',
      response: 'Exercise skipped. Moving to {nextExercise}'
    },
    {
      keywords: ['timer', 'rest time', 'how long'],
      action: 'READ_TIMER',
      response: '{seconds} seconds of rest remaining'
    },
    {
      keywords: ['help', 'commands', 'what can i say'],
      action: 'LIST_COMMANDS',
      response: 'You can say: Done, Pause, Continue, More Weight, Less Weight, or Skip Exercise'
    },
    {
      keywords: ['end workout', 'finish', 'quit'],
      action: 'END_WORKOUT',
      response: 'Do you want to end the workout? Say "yes" to confirm.'
    },
    {
      keywords: ['yes', 'confirm', 'correct'],
      action: 'CONFIRM',
      response: 'Got it!'
    },
    {
      keywords: ['no', 'cancel', 'stop', 'nevermind'],
      action: 'CANCEL',
      response: 'Action cancelled.'
    }
  ]
};

export const getLanguageCode = (lang: string): string => {
  const codes: Record<string, string> = {
    de: 'de-DE',
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    pt: 'pt-PT',
  };
  return codes[lang] || 'en-US';
};
