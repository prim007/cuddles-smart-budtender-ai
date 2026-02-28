import { useCallback, useRef, useState } from "react";

const GREETING_PATTERNS = /^(hey|hello|hi|howdy|yo|sup|what'?s up|greetings|good morning|good evening|good afternoon|hola|bonjour|guten tag)/i;

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasGreetedRef = useRef(false);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown/emojis for cleaner speech
    const cleaned = text
      .replace(/[#*_~`>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/\[ORDER:[^\]]+\]/g, "")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .trim();

    if (!cleaned) return;

    // Limit to first ~300 chars for long responses
    const toSpeak = cleaned.length > 300 ? cleaned.slice(0, 300) + "..." : cleaned;

    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher pitch for a friendly feel
    utterance.volume = 0.9;

    // Try to pick a female voice for Cuddles
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Female")
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const isGreeting = useCallback((text: string) => {
    return GREETING_PATTERNS.test(text.trim());
  }, []);

  const speakIfGreeting = useCallback((userMessage: string, assistantResponse: string) => {
    if (!hasGreetedRef.current && isGreeting(userMessage)) {
      hasGreetedRef.current = true;
      speak(assistantResponse);
      return true;
    }
    return false;
  }, [isGreeting, speak]);

  return { isSpeaking, isSupported, speak, stop, speakIfGreeting };
};
