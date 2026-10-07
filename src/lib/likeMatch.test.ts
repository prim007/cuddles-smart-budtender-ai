import { describe, it, expect } from "vitest";
import { rankMatches, sharedLikes, type LikesProfile } from "./likeMatch";

const p = (id: string, effects: string[] = [], strains: string[] = []): LikesProfile => ({
  user_id: id, display_name: id, liked_effects: effects, liked_flavours: [], liked_topics: [], favourite_strains: strains,
});

describe("like matching", () => {
  it("finds likes shared across categories, case-insensitively", () => {
    expect(sharedLikes(p("a", ["Sleep"], ["Runtz"]), p("b", ["sleep"], ["runtz"]))).toEqual(["Sleep", "Runtz"]);
  });
  it("never suggests people with no shared likes", () => {
    expect(rankMatches(p("a", ["Sleep"]), [p("b", ["Energy"])])).toHaveLength(0);
  });
  it("never suggests yourself or existing connections", () => {
    const me = p("a", ["Sleep"]);
    expect(rankMatches(me, [me, p("b", ["Sleep"])], new Set(["b"]))).toHaveLength(0);
  });
  it("puts the person with the most shared likes first", () => {
    const r = rankMatches(p("a", ["Sleep", "Focus"]), [p("b", ["Sleep"]), p("c", ["Sleep", "Focus"])]);
    expect(r[0].profile.user_id).toBe("c");
  });
});
