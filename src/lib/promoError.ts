import { FunctionsHttpError } from "@supabase/supabase-js";

/** Show actionable account errors, but keep server/internal failures generic. */
export async function promoErrorDescription(error: unknown, fallback: string): Promise<string> {
  if (!(error instanceof FunctionsHttpError)) return fallback;
  const response = error.context;
  if (!(response instanceof Response) || ![401, 403].includes(response.status)) return fallback;
  try {
    const body: unknown = await response.clone().json();
    if (body && typeof body === "object" && "error" in body &&
        typeof body.error === "string" && body.error.trim()) {
      return body.error;
    }
  } catch {
    // Invalid or unreadable responses still get the existing safe fallback.
  }
  return fallback;
}