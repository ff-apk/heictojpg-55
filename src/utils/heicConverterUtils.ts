
import { isHeic } from "heic-to";
import { ImageFormat } from "@/types/heicConverter";

export const isHeicOrHeif = async (file: File): Promise<boolean> => {
  return await isHeic(file);
};

export const getNewFileName = (originalName: string, targetFormat: ImageFormat) => {
  return originalName.replace(/\.(heic|heif)$/i, `.${targetFormat}`);
};

export const convertPngToWebp = async (pngBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to WEBP'));
          }
        },
        'image/webp',
        0.95
      );
    };
    img.onerror = () => reject(new Error('Failed to load PNG image'));
    img.src = URL.createObjectURL(pngBlob);
  });
};
