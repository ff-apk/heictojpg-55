
import { isHeic } from "heic-to";
import { ImageFormat } from "@/types/heicConverter";

export const isHeicOrHeif = async (file: File): Promise<boolean> => {
  try {
    return await isHeic(file);
  } catch (error) {
    console.log('File validation failed, will try as regular image:', error);
    return false;
  }
};

export const getNewFileName = (originalName: string, targetFormat: ImageFormat) => {
  return originalName.replace(/\.(heic|heif)$/i, `.${targetFormat}`);
};

export const processRegularImage = async (
  file: File,
  targetFormat: ImageFormat,
  quality: number = 1
): Promise<{ blob: Blob, previewUrl: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Revoke the object URL as soon as the image loads
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      
      // Set the MIME type based on target format
      const mimeType = targetFormat === 'jpg' 
        ? 'image/jpeg' 
        : targetFormat === 'webp' 
          ? 'image/webp' 
          : 'image/png';
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            // Clear canvas content and remove references
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 0;
            canvas.height = 0;
            resolve({ blob, previewUrl });
          } else {
            reject(new Error(`Failed to convert to ${targetFormat.toUpperCase()}`));
          }
        },
        mimeType,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objectUrl;
  });
};

export const convertPngToWebp = async (pngBlob: Blob, quality: number = 1): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(pngBlob);
    
    img.onload = () => {
      // Revoke the object URL as soon as the image loads
      URL.revokeObjectURL(objectUrl);
      
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
            // Clear canvas content and remove references
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 0;
            canvas.height = 0;
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to WEBP'));
          }
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load PNG image'));
    };
    
    img.src = objectUrl;
  });
};

