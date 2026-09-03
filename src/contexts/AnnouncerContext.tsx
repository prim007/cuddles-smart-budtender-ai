import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface AnnouncerContextValue {
  /** Announce a finished, self-contained message immediately (polite). */
  announce: (message: string) => void;
  /** Urgent announcement — errors only. */
  alert: (message: string) => void;
  /**
   * Feed streaming text. Only complete sentences are announced, at most once
   * per flush interval, so screen readers are not flooded token-by-token.
   */
  streamChunk: (fullTextSoFar: string) => void;
  /** Flush whatever is left of a stream and reset the buffer. */
  endStream: (finalText?: string) => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

const FLUSH_MS = 1200;
const SENTENCE_RE = /[^.!?\n]+[.!?\n]+/g;

export const AnnouncerProvider = ({ children }: { children: ReactNode }) => {
  const { chunkedAnnouncements } = useAccessibility();
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");

  const consumed = useRef(0);
  const pending = useRef<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    timer.current = null;
    if (pending.current.length === 0) return;
    const text = pending.current.join(" ").replace(/\s+/g, " ").trim();
    pending.current = [];
    if (text) setPolite(text);
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) return;
    timer.current = setTimeout(flush, FLUSH_MS);
  }, [flush]);

  const announce = useCallback((message: string) => {
    const text = message.replace(/\s+/g, " ").trim();
    if (!text) return;
    // Re-set with a zero-width marker so identical consecutive messages still fire.
    setPolite((prev) => (prev === text ? `${text}\u200b` : text));
  }, []);

  const alert = useCallback((message: string) => {
    const text = message.replace(/\s+/g, " ").trim();
    if (!text) return;
    setAssertive((prev) => (prev === text ? `${text}\u200b` : text));
  }, []);

  const streamChunk = useCallback(
    (fullTextSoFar: string) => {
      if (!chunkedAnnouncements) return;
      const fresh = fullTextSoFar.slice(consumed.current);
      if (!fresh) return;
      const sentences = fresh.match(SENTENCE_RE);
      if (!sentences?.length) return;
      const taken = sentences.join("");
      consumed.current += taken.length;
      pending.current.push(taken);
      schedule();
    },
    [chunkedAnnouncements, schedule]
  );

  const endStream = useCallback((finalText?: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (finalText && chunkedAnnouncements) {
      const remaining = finalText.slice(consumed.current).replace(/\s+/g, " ").trim();
      if (remaining) pending.current.push(remaining);
    }
    flush();
    consumed.current = 0;
    pending.current = [];
  }, [chunkedAnnouncements, flush]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo(
    () => ({ announce, alert, streamChunk, endStream }),
    [announce, alert, streamChunk, endStream]
  );

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {polite}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="alert">
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
};

export const useAnnouncer = (): AnnouncerContextValue => {
  const ctx = useContext(AnnouncerContext);
  return (
    ctx ?? {
      announce: () => {},
      alert: () => {},
      streamChunk: () => {},
      endStream: () => {},
    }
  );
};
