import { describe, expect, it } from "vitest";
import { authorizePromoRecipient } from "../../supabase/functions/send-promo-code/recipient";

const owner = { id: "owner", email: "owner@example.com", email_confirmed_at: "2026-11-19T09:00:00Z" };

describe("promo-code lead ownership", () => {
  it("rejects anonymous requests targeting an existing lead", () => {
    expect(authorizePromoRecipient(null, "other@example.com")).toEqual({ email: null, status: 401 });
  });
  it("rejects signed-in callers targeting another lead", () => {
    expect(authorizePromoRecipient(owner, "other@example.com")).toEqual({ email: null, status: 403 });
  });
  it("rejects unconfirmed account addresses", () => {
    expect(authorizePromoRecipient({ id: "owner", email: owner.email }, owner.email)).toEqual({ email: null, status: 401 });
  });
  it("uses the verified account email when the request omits it", () => {
    expect(authorizePromoRecipient(owner, undefined)).toEqual({ email: owner.email, status: 200 });
  });
  it("allows only the same address after normalization", () => {
    expect(authorizePromoRecipient(owner, " OWNER@example.com ")).toEqual({ email: owner.email, status: 200 });
  });
});