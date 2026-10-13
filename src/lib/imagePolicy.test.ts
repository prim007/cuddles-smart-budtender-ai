import { describe, expect, it } from "vitest";
import { composeImagePrompt, shouldPause } from "../../supabase/functions/create-cannabis-image/policy";

describe("Cannabis creative requests", () => {
  it("includes the user's cannabis image description", () => {
    expect(composeImagePrompt({ prompt: "A cannabis plant on a balcony", mode: "image", style: "Illustration" })).toContain("A cannabis plant on a balcony");
  });
  it("preserves the user's exact meme captions", () => {
    const prompt = composeImagePrompt({ prompt: "A proud leaf", mode: "meme", style: "Cartoon", topText: "MY FIRST GROW", bottomText: "PLANT PARENT" });
    expect(prompt).toContain('top "MY FIRST GROW"; bottom "PLANT PARENT"');
  });
  it("pauses paid image calls on denial or insufficient credits", () => {
    expect(shouldPause(403)).toBe(true);
    expect(shouldPause(402)).toBe(true);
    expect(shouldPause(429)).toBe(false);
  });
});