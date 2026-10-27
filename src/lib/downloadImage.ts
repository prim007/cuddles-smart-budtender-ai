export function imageDataToBlob(dataUrl: string): Blob {
  const match = /^data:(image\/[\w.+-]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) throw new Error("This image could not be saved. Please create a new image.");
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: match[1] });
}

export function downloadImage(dataUrl: string, filename: string): void {
  const url = URL.createObjectURL(imageDataToBlob(dataUrl));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Keep the URL alive while the browser starts writing the file.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
/** Stamps a small "cuddles-ai.com" mark in the corner (free plan downloads). */
export async function watermarkImage(dataUrl: string): Promise<string> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("This image could not be saved. Please create a new image."));
    img.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0);
  const size = Math.max(16, Math.round(canvas.width * 0.03));
  ctx.font = `600 ${size}px sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.lineWidth = Math.max(2, size / 6);
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  const x = canvas.width - size * 0.8;
  const y = canvas.height - size * 0.6;
  ctx.strokeText("Made with cuddles-ai.com", x, y);
  ctx.fillText("Made with cuddles-ai.com", x, y);
  return canvas.toDataURL("image/png");
}
