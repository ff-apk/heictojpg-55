
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
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const mimeType = targetFormat === 'jpg' 
        ? 'image/jpeg' 
        : targetFormat === 'webp' 
          ? 'image/webp' 
          : 'image/png';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            URL.revokeObjectURL(url);
            reject(new Error('Could not create blob'));
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          URL.revokeObjectURL(url);
          resolve({ blob, previewUrl });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

export const convertPngToWebp = async (pngBlob: Blob, quality: number = 1): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(pngBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            URL.revokeObjectURL(url);
            reject(new Error('Could not create blob'));
            return;
          }
          URL.revokeObjectURL(url);
          resolve(blob);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

export const processInChunks = async <T>(
  items: T[],
  chunkSize: number,
  processor: (item: T) => Promise<void>,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const totalItems = items.length;
  let processedItems = 0;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async (item) => {
      await processor(item);
      processedItems++;
      if (onProgress) {
        onProgress((processedItems / totalItems) * 100);
      }
    }));

    // Small delay between chunks to prevent memory buildup
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
