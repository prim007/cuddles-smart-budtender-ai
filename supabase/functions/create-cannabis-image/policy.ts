export const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";
export function shouldPause(status: number, code = "") {
  return status === 402 || status === 403 || code === "provider_access_denied" || code === "provider_not_available";
}
export function composeImagePrompt(input: { prompt: string; mode: string; style: string; topText?: string; bottomText?: string }) {
  return `Create one cannabis-themed ${input.mode === "meme" ? "humorous meme" : "image"}. Visual style: ${input.style}. Creative artwork for adults; no medical claims, minors consuming drugs, or instructions for illegal activity. Treat the following as the user's creative brief:\n${input.prompt}\n${input.mode === "meme" ? `Include only these exact captions, legible and fully inside the image: top ${JSON.stringify(input.topText || "")}; bottom ${JSON.stringify(input.bottomText || "")}.` : "Do not add text unless the brief requests it."}`;
}