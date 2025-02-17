
import { heicTo } from "heic-to";
import { ImageFormat } from "@/types/heicConverter";
import { convertPngToWebp, getActualFileType, convertNonHeicFile } from "@/utils/heicConverterUtils";

export const convertHeicToFormat = async (
  file: File, 
  targetFormat: ImageFormat,
  quality: number = 1,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob, previewUrl: string, actualMimeType?: string }> => {
  try {
    let convertedBlob: Blob;

    const simulateProgress = (start: number, end: number, duration: number) => {
      const step = 100;
      const increment = (end - start) / step;
      const stepDuration = duration / step;
      
      let currentProgress = start;
      const interval = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= end) {
          clearInterval(interval);
          onProgress?.(end);
        } else {
          onProgress?.(currentProgress);
        }
      }, stepDuration);

      return interval;
    };

    const progressInterval = simulateProgress(0, 90, 2000);

    try {
      if (targetFormat === 'webp') {
        // First convert to PNG using heic-to
        const pngBlob = await heicTo({
          blob: file,
          type: 'image/png',
          quality: 1
        });

        // Then convert PNG to WebP using existing utility with the specified quality
        convertedBlob = await convertPngToWebp(pngBlob, quality);
      } else {
        // Direct conversion to JPG or PNG
        convertedBlob = await heicTo({
          blob: file,
          type: targetFormat === 'jpg' ? 'image/jpeg' : 'image/png',
          quality: quality
        });
      }

      clearInterval(progressInterval);
      onProgress?.(100);

      const previewUrl = URL.createObjectURL(convertedBlob);
      return { blob: convertedBlob, previewUrl };
    } catch (error) {
      // If heic-to conversion fails, check if it's actually a different file type
      const actualMimeType = await getActualFileType(file);
      if (actualMimeType && actualMimeType !== 'image/heic' && actualMimeType !== 'image/heif') {
        clearInterval(progressInterval);
        onProgress?.(100);
        const result = await convertNonHeicFile(file, actualMimeType);
        return { ...result, actualMimeType };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
};

