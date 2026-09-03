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

export type HandSide = "off" | "left" | "right";

export interface AccessibilitySettings {
  /** Root font size percentage — 90 to 180. Everything is rem-based so layout stays intact. */
  fontScale: number;
  /** High-contrast palette targeting a 7:1 (WCAG AAA) text/background ratio. */
  highContrast: boolean;
  /** Anchor floating controls + action rows to one thumb-reachable side. */
  oneHanded: HandSide;
  /** Short earcons for send / reply / error / undo. */
  audioCues: boolean;
  /** Hands-free voice commands (navigate, scroll, undo, read). */
  voiceNav: boolean;
  /** Ignore repeat presses within this window — for tremor / spasms. */
  debounceMs: number;
  /** Screen-reader announcements are batched into sentences instead of per token. */
  chunkedAnnouncements: boolean;
}

const DEFAULTS: AccessibilitySettings = {
  fontScale: 100,
  highContrast: false,
  oneHanded: "off",
  audioCues: false,
  voiceNav: false,
  debounceMs: 0,
  chunkedAnnouncements: true,
};

const STORAGE_KEY = "cuddles:a11y";

interface AccessibilityContextValue extends AccessibilitySettings {
  set: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  reset: () => void;
  /** Wrap a handler so repeat fires inside the debounce window are ignored. */
  guard: <A extends unknown[]>(fn: (...args: A) => void, key?: string) => (...args: A) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const load = (): AccessibilitySettings => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AccessibilitySettings>) };
  } catch {
    return DEFAULTS;
  }
};

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(load);
  const lastFire = useRef<Record<string, number>>({});

  const set = useCallback<AccessibilityContextValue["set"]>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage blocked — settings stay session-only */
    }

    const root = document.documentElement;
    root.style.fontSize = `${settings.fontScale}%`;
    root.classList.toggle("a11y-contrast", settings.highContrast);
    root.dataset.hand = settings.oneHanded;
    root.classList.toggle("a11y-one-handed", settings.oneHanded !== "off");
  }, [settings]);

  const guard = useCallback<AccessibilityContextValue["guard"]>(
    (fn, key = "default") =>
      (...args) => {
        const wait = settings.debounceMs;
        if (wait > 0) {
          const now = Date.now();
          if (now - (lastFire.current[key] ?? 0) < wait) return;
          lastFire.current[key] = now;
        }
        fn(...args);
      },
    [settings.debounceMs]
  );

  const value = useMemo(() => ({ ...settings, set, reset, guard }), [settings, set, reset, guard]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used inside AccessibilityProvider");
  return ctx;
};
