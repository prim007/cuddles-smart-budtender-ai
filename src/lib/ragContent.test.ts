import { describe, expect, it } from "vitest";
import { articleKnowledge, lefStrainKnowledge } from "./ragContent";
import { staticBlogPosts } from "../data/staticBlogPosts";
import { DISPENSARY_MENUS } from "../data/dispensaryMenus";

describe("requested knowledge refresh", () => {
  it("includes the 750 g explainer without presenting proposed limits as enacted", () => {
    const post = staticBlogPosts.find(p => p.slug === "sa-cannabis-750g-possession-limit-2026");
    if (!post) throw new Error("Missing requested law explainer");
    const docs = articleKnowledge(post);
    expect(docs.length).toBeGreaterThan(1);
    for (const doc of docs) {
      expect(doc.content).toContain("750 g and five-plant figures");
      expect(doc.content).toContain("proposals, not confirmed enacted limits");
      expect(`${doc.title}. ${doc.content}`.length).toBeLessThan(6000);
    }
  });
  it("includes LëF flower notes, not dated delivery or back-in-stock promises", () => {
    const menu = DISPENSARY_MENUS.find(m => m.id === "leaf-labs");
    if (!menu) throw new Error("Missing requested catalogue");
    const docs = lefStrainKnowledge(menu.items);
    expect(docs.some(d => d.title.includes("Blue Zushi"))).toBe(true);
    expect(docs.some(d => d.content.includes("Back in supply"))).toBe(false);
    expect(docs.some(d => d.title.includes("Same-day"))).toBe(false);
    expect(docs.every(d => d.content.includes("does not confirm current stock"))).toBe(true);
  });
});