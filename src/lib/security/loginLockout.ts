// Client-side progressive lockout for repeated failed sign-in attempts.
// Complements server-side auth rate limiting: it stops credential-stuffing
// scripts driving the UI and gives honest feedback to real users.

const STORAGE_KEY = "cuddles_login_attempts_v1";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // attempts older than this are forgotten
const LOCKOUT_MS = 15 * 60 * 1000; // lock duration once the limit is hit

type AttemptRecord = { failures: number[]; lockedUntil?: number };
type Store = Record<string, AttemptRecord>;

const normalize = (email: string) => email.trim().toLowerCase();

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — fail open */
  }
}

export interface LockoutState {
  locked: boolean;
  /** Whole minutes remaining before another attempt is allowed. */
  minutesRemaining: number;
  /** Attempts left before a lockout kicks in. */
  attemptsRemaining: number;
}

export function getLockoutState(email: string): LockoutState {
  const key = normalize(email);
  const now = Date.now();
  const record = readStore()[key];

  if (!record) return { locked: false, minutesRemaining: 0, attemptsRemaining: MAX_ATTEMPTS };

  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      locked: true,
      minutesRemaining: Math.max(1, Math.ceil((record.lockedUntil - now) / 60000)),
      attemptsRemaining: 0,
    };
  }

  const recent = (record.failures ?? []).filter((t) => now - t < WINDOW_MS);
  return {
    locked: false,
    minutesRemaining: 0,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - recent.length),
  };
}

/** Records a failed attempt and returns the resulting state. */
export function recordFailedAttempt(email: string): LockoutState {
  const key = normalize(email);
  const now = Date.now();
  const store = readStore();
  const record = store[key] ?? { failures: [] };

  const recent = (record.failures ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);

  const next: AttemptRecord = { failures: recent };
  if (recent.length >= MAX_ATTEMPTS) {
    next.lockedUntil = now + LOCKOUT_MS;
    next.failures = [];
  }

  store[key] = next;
  writeStore(store);
  return getLockoutState(email);
}

/** Clears attempts after a successful sign-in. */
export function clearFailedAttempts(email: string) {
  const store = readStore();
  delete store[normalize(email)];
  writeStore(store);
}

export const LOGIN_LOCKOUT_MAX_ATTEMPTS = MAX_ATTEMPTS;
