
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
    const createImageBitmap = async (file: File): Promise<ImageBitmap> => {
      const buffer = await file.arrayBuffer();
      return window.createImageBitmap(new Blob([buffer]));
    };

    createImageBitmap(file)
      .then(bitmap => {
        // Create an offscreen canvas for better memory management
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(bitmap, 0, 0);
        bitmap.close(); // Release bitmap memory

        const mimeType = targetFormat === 'jpg' 
          ? 'image/jpeg' 
          : targetFormat === 'webp' 
            ? 'image/webp' 
            : 'image/png';

        canvas.convertToBlob({
          type: mimeType,
          quality: quality
        }).then(blob => {
          const previewUrl = URL.createObjectURL(blob);
          resolve({ blob, previewUrl });
        }).catch(reject);
      })
      .catch(reject);
  });
};

export const convertPngToWebp = async (pngBlob: Blob, quality: number = 1): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    createImageBitmap(pngBlob)
      .then(bitmap => {
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(bitmap, 0, 0);
        bitmap.close(); // Release bitmap memory

        canvas.convertToBlob({
          type: 'image/webp',
          quality: quality
        }).then(resolve).catch(reject);
      })
      .catch(reject);
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

    // Force garbage collection if available
    if (typeof window.gc === 'function') {
      window.gc();
    }

    // Small delay between chunks to prevent memory buildup
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

