import { describe, it, expect } from "vitest";
import { imageDataToBlob } from "./downloadImage";

describe("generated image downloads", () => {
  it("preserves PNG file bytes and MIME type", () => {
    const blob = imageDataToBlob("data:image/png;base64,iVBORw0KGgo=");
    expect(blob.type).toBe("image/png");
    expect(blob.size).toBe(8);
  });
  it("rejects a non-image source", () => {
    expect(() => imageDataToBlob("javascript:alert(1)")).toThrow();
  });
});