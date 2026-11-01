import { describe, it, expect } from "vitest";
import { buildEmbedSnippet, WIDGET_SCRIPT_URL } from "./embedSnippet";

describe("buildEmbedSnippet", () => {
  it("loads the widget from the live Cuddles domain", () => {
    expect(WIDGET_SCRIPT_URL).toBe("https://cuddles-ai.com/widget.js");
    expect(buildEmbedSnippet({ key: "abc" })).toContain('src="https://cuddles-ai.com/widget.js"');
  });

  it("includes the shop's key and colour", () => {
    const s = buildEmbedSnippet({ key: "abc123", color: "#ff7a59" });
    expect(s).toContain('data-key="abc123"');
    expect(s).toContain('data-color="#ff7a59"');
  });

  it("only adds a position when it is left", () => {
    expect(buildEmbedSnippet({ key: "k" })).not.toContain("data-position");
    expect(buildEmbedSnippet({ key: "k", position: "left" })).toContain('data-position="left"');
  });
});
