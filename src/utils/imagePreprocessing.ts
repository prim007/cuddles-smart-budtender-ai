const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1280;
const JPEG_QUALITY = 0.82;

export const prepareImageForAnalysis = async (file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be less than 20MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This image format could not be opened. Please try a JPG, PNG, or WEBP image."));
      img.src = objectUrl;
    });

    const scale = Math.min(MAX_IMAGE_SIDE / image.naturalWidth, MAX_IMAGE_SIDE / image.naturalHeight, 1);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is not available in this browser.");

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY).replace(/\s/g, "");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};