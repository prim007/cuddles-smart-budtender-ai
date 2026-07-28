import { describe, it, expect } from "vitest";
import { isUiRoast } from "./uiRoast";

describe("isUiRoast", () => {
  const roasts = [
    "this UI is a mess",
    "the design is so bad lol",
    "your website looks like it's from the 1990s",
    "honestly the layout is cluttered and confusing",
    "these colors are ugly 😂",
    "the app is ugly ngl",
    "the interface needs a redesign",
    "whoever picked these fonts, yikes",
    "this theme is tacky",
    "the buttons are hideous",
    "lmao the logo",
    "the look and feel is dated",
  ];

  const notRoasts = [
    "what strain helps with sleep?",
    "what does Blue Dream look like?",
    "I had a bad experience with edibles",
    "can you show me the dirty vapes menu",
    "the design of the joint is nice", // product context, not UI
    "how much THC is in this?",
    "I love the site", // no criticism
    "the website is great",
    "my anxiety is bad today",
    "show me the strain page",
    "lol that's funny", // no UI topic
    "",
  ];

  it.each(roasts)("fires on UI criticism: %s", (text) => {
    expect(isUiRoast(text)).toBe(true);
  });

  it.each(notRoasts)("stays quiet on: %s", (text) => {
    expect(isUiRoast(text)).toBe(false);
  });
});
