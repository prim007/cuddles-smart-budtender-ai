import cuddlesImageUrl from "@/assets/cuddles.png";
import { removeBackground, loadImage } from "./removeBackground";

export const processCuddlesImage = async (): Promise<string> => {
  try {
    // Fetch the image
    const response = await fetch(cuddlesImageUrl);
    const blob = await response.blob();
    
    // Load as HTMLImageElement
    const img = await loadImage(blob);
    
    // Remove background
    const processedBlob = await removeBackground(img);
    
    // Convert to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(processedBlob);
    });
  } catch (error) {
    console.error('Failed to process Cuddles image:', error);
    // Return original image if processing fails
    return cuddlesImageUrl;
  }
};
