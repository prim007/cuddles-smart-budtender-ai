// Tracked share links so Google Analytics can tell which channel sent a visitor.
export const SITE_URL = "https://cuddles-ai.com";

export type ShareChannel = "whatsapp" | "facebook" | "copy";

export function trackedUrl(path: string, source: ShareChannel, campaign: string): string {
  const url = new URL(path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);
  url.searchParams.set("utm_source", source === "copy" ? "share_link" : source);
  url.searchParams.set("utm_medium", source === "copy" ? "referral" : "social");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export function whatsappShareUrl(path: string, campaign: string, text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${trackedUrl(path, "whatsapp", campaign)}`)}`;
}

export function facebookShareUrl(path: string, campaign: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackedUrl(path, "facebook", campaign))}`;
}
