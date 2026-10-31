import { describe, expect, it } from "vitest";
import { facebookShareUrl, trackedUrl, whatsappShareUrl } from "./shareLinks";

describe("tracked share links", () => {
  it("labels WhatsApp shares as whatsapp / social with the campaign", () => {
    const u = new URL(trackedUrl("/blog/x", "whatsapp", "blog_share"));
    expect(u.origin).toBe("https://cuddles-ai.com");
    expect(u.searchParams.get("utm_source")).toBe("whatsapp");
    expect(u.searchParams.get("utm_medium")).toBe("social");
    expect(u.searchParams.get("utm_campaign")).toBe("blog_share");
  });

  it("labels copied links as share_link / referral", () => {
    const u = new URL(trackedUrl("/reports/plant-questions", "copy", "monthly_report"));
    expect(u.searchParams.get("utm_source")).toBe("share_link");
    expect(u.searchParams.get("utm_medium")).toBe("referral");
  });

  it("puts the tracked link inside the WhatsApp and Facebook share addresses", () => {
    expect(decodeURIComponent(whatsappShareUrl("/a", "c", "Hi"))).toContain("utm_source=whatsapp");
    expect(decodeURIComponent(facebookShareUrl("/a", "c"))).toContain("utm_source=facebook");
  });
});
