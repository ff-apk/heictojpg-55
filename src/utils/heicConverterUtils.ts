
import { isHeic } from "heic-to";
import { ImageFormat } from "@/types/heicConverter";
import { fileTypeFromBlob } from 'file-type';

export const isHeicOrHeif = async (file: File): Promise<boolean> => {
  try {
    // First try using heic-to library
    return await isHeic(file);
  } catch (error) {
    // If heic-to fails, use file-type as fallback
    const type = await fileTypeFromBlob(file);
    return type?.mime === 'image/heic' || type?.mime === 'image/heif';
  }
};

export const getActualFileType = async (file: File): Promise<string | null> => {
  try {
    const type = await fileTypeFromBlob(file);
    return type?.mime || null;
  } catch (error) {
    console.error('Error detecting file type:', error);
    return null;
  }
};

export const getNewFileName = (originalName: string, targetFormat: ImageFormat) => {
  return originalName.replace(/\.(heic|heif)$/i, `.${targetFormat}`);
};

export const convertPngToWebp = async (pngBlob: Blob, quality: number = 1): Promise<Blob> => {
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
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load PNG image'));
    img.src = URL.createObjectURL(pngBlob);
  });
};

export const convertNonHeicFile = async (file: File, actualMimeType: string): Promise<{ blob: Blob, previewUrl: string }> => {
  // For non-HEIC files, we'll just return them as-is with their actual type
  const previewUrl = URL.createObjectURL(file);
  return { blob: file, previewUrl };
};

