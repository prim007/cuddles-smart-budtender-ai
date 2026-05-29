import { useCallback, useEffect, useRef, useState } from "react";

const GREETING_PATTERNS = /^(hey|hello|hi|howdy|yo|sup|what'?s up|greetings|good morning|good evening|good afternoon|hola|bonjour|guten tag)/i;

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasGreetedRef = useRef(false);
  const unlockedRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Preload voices (Chrome loads them async)
  useEffect(() => {
    if (!isSupported) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  /**
   * Must be called synchronously inside a user gesture (click/tap) BEFORE any
   * await. Chrome requires speechSynthesis to be activated from a gesture;
   * once unlocked, subsequent speak() calls work even after async work.
   */
  const prime = useCallback(() => {
    if (!isSupported || unlockedRef.current) return;
    try {
      // Speaking an empty utterance during a gesture unlocks the API for the session.
      const primer = new SpeechSynthesisUtterance(" ");
      primer.volume = 0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(primer);
      unlockedRef.current = true;
    } catch (e) {
      console.warn("[tts] prime failed", e);
    }
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Clean markdown/emojis for cleaner speech
    const cleaned = text
      .replace(/[#*_~`>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\[ORDER:[^\]]+\]/g, "")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .trim();

    if (!cleaned) return;

    const toSpeak = cleaned.length > 300 ? cleaned.slice(0, 300) + "..." : cleaned;

    // Cancel any ongoing speech, then resume in case engine was paused
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    utterance.lang = "en-US";

    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name.includes("Samantha")) ||
      voices.find((v) => v.name.includes("Google UK English Female")) ||
      voices.find((v) => /female/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.warn("[tts] error", (e as SpeechSynthesisErrorEvent).error);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    // Chrome bug: long utterances pause after ~15s. Keep alive.
    if (toSpeak.length > 80) {
      const keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(keepAlive);
          return;
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
      utterance.addEventListener("end", () => clearInterval(keepAlive));
      utterance.addEventListener("error", () => clearInterval(keepAlive));
    }
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

  return { isSpeaking, isSupported, speak, stop, speakIfGreeting, prime };
};
