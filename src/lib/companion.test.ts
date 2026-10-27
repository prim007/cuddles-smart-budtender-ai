import { describe, expect, it } from "vitest";
import { canShareConversation } from "./companion";

describe("Companion privacy", () => {
  it("keeps personal conversations owner-only", () => {
    expect(canShareConversation("prim", null, "prim", false)).toBe(true);
    expect(canShareConversation("prim", null, "other", true)).toBe(false);
  });
  it("allows accepted friends but not strangers", () => {
    expect(canShareConversation("prim", "friend", "friend", true)).toBe(true);
    expect(canShareConversation("prim", "friend", "stranger", true)).toBe(false);
  });
  it("hides shared conversations from both people after disconnecting", () => {
    expect(canShareConversation("prim", "friend", "friend", false)).toBe(false);
    expect(canShareConversation("prim", "friend", "prim", false)).toBe(false);
  });
});