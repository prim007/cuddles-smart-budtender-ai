/**
 * Validates that a URL is a safe HTTP/HTTPS URL.
 * Prevents javascript:, data:, and other potentially dangerous URI schemes.
 * This provides client-side defense-in-depth alongside server-side validation.
 */
export const isValidHttpUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
