import { useState, useEffect, useCallback, useRef } from "react";

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Language code mapping for Web Speech API
const languageCodeMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  af: "af-ZA",
  zu: "zu-ZA",
};

export const useVoiceInput = ({
  onResult,
  onError,
  language = "en",
  continuous = false,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = languageCodeMap[language] || "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript && onResult) {
          onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        if (onError) {
          switch (event.error) {
            case "not-allowed":
              onError("Microphone access denied. Please enable microphone permissions.");
              break;
            case "no-speech":
              onError("No speech detected. Please try again.");
              break;
            case "audio-capture":
              onError("No microphone found. Please check your device.");
              break;
            case "network":
              onError("Network error. Please check your connection.");
              break;
            default:
              onError(`Speech recognition error: ${event.error}`);
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, language, onResult, onError]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageCodeMap[language] || "en-US";
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        if (onError) {
          onError("Failed to start voice input. Please try again.");
        }
      }
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  };
};

// Web Speech API types are provided by @types/dom-speech-recognition if needed
// For now, we use 'any' to avoid TypeScript issues with browser-specific APIs
