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