// In-memory per-IP sliding-window rate limiter for Supabase Edge Functions.
//
// IMPORTANT: state is per-instance only. Cold starts reset counters and
// counters are NOT shared across edge function replicas. This is sufficient
// to deter casual abuse and protect paid AI / TTS spend; it is not a
// hardened defense against a determined distributed attacker.

type Bucket = number[];
const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Unique key for this limiter (e.g. function name). */
  scope: string;
  /** Max requests allowed per IP within the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * Records a hit on success.
 */
export function checkRateLimit(req: Request, opts: RateLimitOptions): boolean {
  const ip = getClientIp(req);
  const key = `${opts.scope}:${ip}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < opts.windowMs);

  if (hits.length >= opts.max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Convenience: returns a 429 Response if rate-limited, else null. */
export function rateLimitResponse(
  req: Request,
  opts: RateLimitOptions,
  corsHeaders: Record<string, string>,
): Response | null {
  if (checkRateLimit(req, opts)) return null;
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
