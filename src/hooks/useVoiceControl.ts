import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceCommand {
  keywords: string[];
  action: string;
  response: string;
}

interface UseVoiceControlOptions {
  language?: string;
  onCommand?: (action: string, params?: Record<string, string>) => void;
}

export function useVoiceControl(options: UseVoiceControlOptions = {}) {
  const { language = 'de-DE', onCommand } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const commandsRef = useRef<VoiceCommand[]>([]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition && 'speechSynthesis' in window);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      setTranscript(interimTranscript || finalTranscript);
      
      if (finalTranscript) {
        processCommand(finalTranscript.toLowerCase().trim());
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };
    
    recognition.onend = () => {
      if (isListening) {
        // Restart if we're supposed to be listening
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      recognition.stop();
    };
  }, [isSupported, language, isListening]);

  const processCommand = useCallback((text: string) => {
    for (const command of commandsRef.current) {
      for (const keyword of command.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          onCommand?.(command.action);
          return;
        }
      }
    }
  }, [onCommand]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return false;
    }
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recognitionRef.current?.start();
      setIsListening(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error starting voice control:', err);
      setError('Microphone access denied');
      return false;
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript('');
  }, []);

  const speak = useCallback((text: string, callback?: () => void) => {
    if (!('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    
    // Try to find a voice matching the language
    const voices = speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      callback?.();
    };
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const registerCommands = useCallback((commands: VoiceCommand[]) => {
    commandsRef.current = commands;
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    registerCommands,
  };
}

// Web Speech API type declarations - must be before usage
interface SpeechRecognitionAlternativeType {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultType {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternativeType;
  [index: number]: SpeechRecognitionAlternativeType;
}

interface SpeechRecognitionResultListType {
  readonly length: number;
  item(index: number): SpeechRecognitionResultType;
  [index: number]: SpeechRecognitionResultType;
}

interface SpeechRecognitionEventType extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListType;
}

interface SpeechRecognitionErrorEventType extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventType) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventType) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionType;
  prototype: SpeechRecognitionType;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export type { SpeechRecognitionType };
